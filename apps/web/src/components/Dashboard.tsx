import React, { useState, useEffect, useCallback } from 'react';
import '../index.css';
import {
  useGetQuotations,
  useGetProformaInvoices,
  useGetFinalInvoices,
  useCreateQuotation,
  useCreateProformaInvoice,
  useCreateFinalInvoice,
  useGetClients,
  useCreateClient,
  useConvertQuoteToProforma,
  useConvertQuoteToInvoice,
  useConvertProformaToInvoice,
  useUpdateQuotation,
  useUpdateProformaInvoice,
  useUpdateFinalInvoice,
  useDeleteQuotation,
  useDeleteProformaInvoice,
  useDeleteFinalInvoice,
  useGetClientLedger,
  useRecordClientPayment,
} from '@procash-invoices/api-client';
import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';
import { generateDocumentHtml } from '@procash-invoices/document-templates';
import ExcelJS from 'exceljs';

import { TenantProfile, ViewMode, DocumentItem, Client } from './dashboard/types';
import {
  getApiBaseUrl,
  getPlanPriceNum,
  getFinancialYear,
  getDocumentData,
  isToday
} from './dashboard/utils';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStats } from './dashboard/DashboardStats';
import { QuotationsSection } from './dashboard/QuotationsSection';
import { ProformaSection } from './dashboard/ProformaSection';
import { InvoicesSection } from './dashboard/InvoicesSection';
import { ClientLedgerSection } from './dashboard/ClientLedgerSection';
import { SubscriptionSection } from './dashboard/SubscriptionSection';
import { CreateDocumentModal } from './dashboard/modals/CreateDocumentModal';
import { SubscriptionModal } from './dashboard/modals/SubscriptionModal';
import { TenantSettingsModal } from './dashboard/modals/TenantSettingsModal';
import { RecordPaymentModal } from './dashboard/modals/RecordPaymentModal';
import { ExcelPreviewModal } from './dashboard/modals/ExcelPreviewModal';
import { PrintPreviewModal } from './dashboard/modals/PrintPreviewModal';

export default function Dashboard() {
  // Querying using shared TanStack Query hooks from @procash-invoices/api-client
  const { data: quotations = [], isLoading: loadingQuotes, error: errorQuotes } = useGetQuotations();
  const { data: proformas = [], isLoading: loadingProformas, error: errorProformas } = useGetProformaInvoices();
  const { data: invoices = [], isLoading: loadingInvoices, error: errorInvoices } = useGetFinalInvoices();
  const { data: clients = [], isLoading: loadingClients } = useGetClients();

  const createClientMutation = useCreateClient();
  const createQuotation = useCreateQuotation();
  const createProforma = useCreateProformaInvoice();
  const createInvoice = useCreateFinalInvoice();
  const convertQuote = useConvertQuoteToProforma();
  const convertQuoteToInvoice = useConvertQuoteToInvoice();
  const convertProforma = useConvertProformaToInvoice();
  const updateQuotation = useUpdateQuotation();
  const updateProforma = useUpdateProformaInvoice();
  const updateInvoice = useUpdateFinalInvoice();
  const deleteQuotation = useDeleteQuotation();
  const deleteProforma = useDeleteProformaInvoice();
  const deleteInvoice = useDeleteFinalInvoice();

  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);

  // Workspace Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsData, setSettingsData] = useState<any>({
    companyName: '',
    proprietorName: '',
    address: '',
    gstin: '',
    pan: '',
    bankName: '',
    bankAccHolder: '',
    bankAccType: 'Current A/C',
    bankAccNumber: '',
    bankIfsc: '',
    bankBranch: '',
    logoUrl: '',
    signatureUrl: '',
    theme: 'DEFAULT',
    tier: 'FREE'
  });

  // Expiration Renewal & Plan Change Modal States
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('1_MONTH');
  const [renewalUtr, setRenewalUtr] = useState('');
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalStatus, setRenewalStatus] = useState('');

  // Dynamic Subscription Plans State synced from Backend
  const [dynamicPlansMap, setDynamicPlansMap] = useState<Record<string, any>>({});

  const fetchSubscriptionPlans = useCallback(() => {
    const plansApiUrl = getApiBaseUrl() + '/subscription-plans';
    fetch(plansApiUrl)
      .then(res => res.ok ? res.json() : [])
      .then(list => {
        if (Array.isArray(list)) {
          const map: Record<string, any> = {};
          list.forEach((p: any) => {
            map[p.planId] = p;
          });
          setDynamicPlansMap(map);
        }
      })
      .catch(err => console.error('Failed to fetch subscription plans in dashboard:', err));
  }, []);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  useEffect(() => {
    if (isRenewalOpen) {
      fetchSubscriptionPlans();
    }
  }, [isRenewalOpen, fetchSubscriptionPlans]);

  const handleRenewalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = renewalUtr.trim();
    if (!cleanUtr || cleanUtr.length !== 12) {
      alert('Please enter a valid 12-digit numeric UPI Ref / UTR number.');
      return;
    }

    setRenewalLoading(true);
    setRenewalStatus('Submitting renewal UTR reference for verification...');
    const tenantId = window.location.hostname.split('.')[0];

    try {
      const apiUrl = getApiBaseUrl() + '/subscriptions/submit-payment';
      const activeTargetPlan = selectedPlan || tenantProfile?.subscriptionPlan || '1_MONTH';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          planTier: activeTargetPlan,
          amountPaid: getPlanPriceNum(activeTargetPlan, dynamicPlansMap),
          utrNumber: cleanUtr
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Renewal submission failed.');
      }

      const responseData = await res.json();
      setRenewalStatus(`🎉 ${responseData.message || 'Payment submitted successfully!'}`);
      
      setTimeout(() => {
        setIsRenewalOpen(false);
        setRenewalUtr('');
        setRenewalStatus('');
      }, 4000);

    } catch (err: any) {
      console.error(err);
      setRenewalStatus(`❌ Error: ${err.message || 'UTR submission failed.'}`);
    } finally {
      setRenewalLoading(false);
    }
  };

  const handleWorkspaceLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsData((prev: any) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkspaceSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsData((prev: any) => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = getApiBaseUrl() + '/tenant-profile';
      const tenantId = window.location.hostname.split('.')[0];
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(settingsData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save settings');
      }
      const updatedProfile = await res.json();
      setTenantProfile(updatedProfile);
      if (updatedProfile.theme) {
        document.documentElement.setAttribute('data-theme', updatedProfile.theme);
      }
      setIsSettingsOpen(false);
      alert('Workspace settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Something went wrong while saving settings.');
    }
  };

  useEffect(() => {
    const apiUrl = getApiBaseUrl() + '/tenant-profile';
    const tenantId = window.location.hostname.split('.')[0];
    
    fetch(apiUrl, {
      headers: {
        'X-Tenant-Id': tenantId
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data) {
          setTenantProfile(data);
          setSettingsData({
            companyName: data.companyName || '',
            proprietorName: data.proprietorName || '',
            address: data.address || '',
            gstin: data.gstin || '',
            pan: data.pan || '',
            bankName: data.bankName || '',
            bankAccHolder: data.bankAccHolder || '',
            bankAccType: data.bankAccType || 'Current A/C',
            bankAccNumber: data.bankAccNumber || '',
            bankIfsc: data.bankIfsc || '',
            bankBranch: data.bankBranch || '',
            logoUrl: data.logoUrl || '',
            signatureUrl: data.signatureUrl || '',
            theme: data.theme || 'DEFAULT',
            tier: data.tier || 'FREE'
          });
          if (data.theme) {
            document.documentElement.setAttribute('data-theme', data.theme);
          }
        }
      })
      .catch(err => console.log('No tenant profile active yet:', err.message));
  }, []);

  const isApiError = Boolean(errorQuotes || errorProformas || errorInvoices);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState<'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE'>('QUOTATION');
  const [printDoc, setPrintDoc] = useState<Quotation | ProformaInvoice | FinalInvoice | null>(null);
  const [editingDoc, setEditingDoc] = useState<Quotation | ProformaInvoice | FinalInvoice | null>(null);
  const [logoUrl, setLogoUrl] = useState('');

  const handleDownloadHtml = (doc: any) => {
    const docData = getDocumentData(doc, tenantProfile);
    const htmlContent = generateDocumentHtml(docData);
    const docNum = doc.documentNumber || doc.quoteNumber || doc.proformaNumber || doc.invoiceNumber || 'document';
    const safeNum = docNum.replace(/\//g, '-');
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.documentType || 'document'}_${safeNum}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Daily Mode, History, Ledger & Subscription States
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
  const [excelPreviewTab, setExcelPreviewTab] = useState<'Quotations' | 'Proformas' | 'Final Invoices'>('Quotations');

  // Ledger State & Hooks
  const [selectedLedgerClientId, setSelectedLedgerClientId] = useState<string>('');
  const { data: ledgerData, isLoading: loadingLedger } = useGetClientLedger(selectedLedgerClientId);
  const recordPaymentMutation = useRecordClientPayment();

  // Payment Recording Modal State
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({
    clientId: '',
    invoiceId: '',
    invoiceNumber: '',
    amount: 0,
    type: 'PAYMENT_RECEIVED' as 'PAYMENT_RECEIVED' | 'ADVANCE_PAYMENT' | 'REFUND',
    paymentMode: 'CASH' as 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER',
    referenceNo: '',
    notes: '',
  });

  // Advance Payment collected during Invoice Drafting
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [initialPaymentMode, setInitialPaymentMode] = useState<string>('CASH');
  const [initialPaymentRef, setInitialPaymentRef] = useState<string>('');

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    billingAddress: '',
    taxId: '',
    gstin: '',
    pan: '',
  });

  const [docNumber, setDocNumber] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([
    { description: '', quantity: 1, price: 0, taxRate: 18, hsnSac: '998311', discountPercent: 0 }
  ]);
  const [quotationRef, setQuotationRef] = useState('');
  const [proformaRef, setProformaRef] = useState('');
  const [importSource, setImportSource] = useState<'NONE' | 'QUOTATION' | 'PROFORMA'>('NONE');

  const handleImportSourceChange = (source: 'NONE' | 'QUOTATION' | 'PROFORMA') => {
    setImportSource(source);
    if (source === 'NONE') {
      setQuotationRef('');
      setProformaRef('');
    } else if (source === 'QUOTATION') {
      setProformaRef('');
    } else if (source === 'PROFORMA') {
      setQuotationRef('');
    }
  };

  const filterBySearchAndDate = (list: any[]) => {
    let filtered = list;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const docNum = (item.documentNumber || item.quoteNumber || item.proformaNumber || item.invoiceNumber || '').toLowerCase();
        const clientName = (item.clientInfo?.name || '').toLowerCase();
        const clientEmail = (item.clientInfo?.email || '').toLowerCase();
        return docNum.includes(query) || clientName.includes(query) || clientEmail.includes(query);
      });
    }
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt || item.issueDate);
        return itemDate >= start;
      });
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt || item.issueDate);
        return itemDate <= end;
      });
    }
    
    return filtered;
  };

  const filteredQuotes = viewMode === 'daily'
    ? quotations.filter((q: any) => isToday(q.createdAt || q.issueDate))
    : filterBySearchAndDate(quotations);

  const filteredProformas = viewMode === 'daily'
    ? proformas.filter((p: any) => isToday(p.createdAt || p.issueDate))
    : filterBySearchAndDate(proformas);

  const filteredInvoices = viewMode === 'daily'
    ? invoices.filter((i: any) => isToday(i.createdAt || i.issueDate))
    : filterBySearchAndDate(invoices);

  const totalQuoteVolume = quotations.reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0);
  const totalProformaVolume = proformas.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);
  const totalInvoiceVolume = invoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

  const todayQuoteVolume = (quotations as Quotation[]).filter((q: any) => isToday(q.createdAt || q.issueDate)).reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const todayProformaVolume = (proformas as ProformaInvoice[]).filter((p: any) => isToday(p.createdAt || p.issueDate)).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const todayInvoiceVolume = (invoices as FinalInvoice[]).filter((i: any) => isToday(i.createdAt || i.issueDate)).reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const activeQuoteVolume = viewMode === 'daily' ? todayQuoteVolume : totalQuoteVolume;
  const activeProformaVolume = viewMode === 'daily' ? todayProformaVolume : totalProformaVolume;
  const activeInvoiceVolume = viewMode === 'daily' ? todayInvoiceVolume : totalInvoiceVolume;

  const activeQuoteCount = viewMode === 'daily' ? filteredQuotes.length : quotations.length;
  const activeProformaCount = viewMode === 'daily' ? filteredProformas.length : proformas.length;
  const activeInvoiceCount = viewMode === 'daily' ? filteredInvoices.length : invoices.length;

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = tenantProfile?.companyName || 'PROCash Invoice ERP';
    workbook.created = new Date();

    const generateSheet = (sheetName: string, titleText: string, headers: string[], dataList: any[]) => {
      const sheet = workbook.addWorksheet(sheetName, {
        views: [{ showGridLines: true }]
      });

      sheet.mergeCells('A1:I1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = titleText;
      titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF4F46E5' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

      const headerRow = sheet.addRow(headers);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF312E81' } },
          left: { style: 'thin', color: { argb: 'FF312E81' } },
          bottom: { style: 'medium', color: { argb: 'FF312E81' } },
          right: { style: 'thin', color: { argb: 'FF312E81' } }
        };
      });

      dataList.forEach((rowVal: any[], rowIndex: number) => {
        const row = sheet.addRow(rowVal);
        row.height = 20;

        const isEven = rowIndex % 2 === 0;
        const bgHex = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Calibri', size: 10 };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgHex }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };

          if (colNumber >= 6 && colNumber <= 8) {
            cell.numFmt = '₹#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else if (colNumber === 4 || colNumber === 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }
        });
      });

      sheet.columns = [
        { width: 22 },
        { width: 28 },
        { width: 28 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 16 }
      ];
    };

    const quotesData = filteredQuotes.map((q: any) => [
      q.quoteNumber || q.documentNumber || '',
      q.clientInfo?.name || '',
      q.clientInfo?.email || '',
      q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
      q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '',
      q.subtotal || 0,
      q.taxAmount || 0,
      q.totalAmount || 0,
      q.status || ''
    ]);

    generateSheet(
      'Quotations',
      'Quotations Billing Archive Report',
      ['Quote Number', 'Client Name', 'Client Email', 'Date', 'Valid Until', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status'],
      quotesData
    );

    const proformasData = filteredProformas.map((p: any) => [
      p.proformaNumber || p.documentNumber || '',
      p.clientInfo?.name || '',
      p.clientInfo?.email || '',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
      p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '',
      p.subtotal || 0,
      p.taxAmount || 0,
      p.totalAmount || 0,
      p.status || ''
    ]);

    generateSheet(
      'Proforma Invoices',
      'Proforma Invoices Billing Archive Report',
      ['Proforma Number', 'Client Name', 'Client Email', 'Date', 'Due Date', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status'],
      proformasData
    );

    const invoicesData = filteredInvoices.map((i: any) => [
      i.invoiceNumber || i.documentNumber || '',
      i.clientInfo?.name || '',
      i.clientInfo?.email || '',
      i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '',
      i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '',
      i.subtotal || 0,
      i.taxAmount || 0,
      i.totalAmount || 0,
      i.status || ''
    ]);

    generateSheet(
      'Final Invoices',
      'Final Invoices Billing Archive Report',
      ['Invoice Number', 'Client Name', 'Client Email', 'Date', 'Due Date', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status'],
      invoicesData
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Billing_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Form Handlers
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, taxRate: 18, hsnSac: '998311', discountPercent: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setItems(updated);
  };

  const getItemQty = (qty: number | undefined) => {
    return qty !== undefined && qty !== null ? qty : 1;
  };

  const formSubTotal = items.reduce((sum, item) => {
    const base = getItemQty(item.quantity) * item.price;
    const disc = base * ((Number(item.discountPercent) || 0) / 100);
    return sum + (base - disc);
  }, 0);
  const formTaxAmount = items.reduce((sum, item) => {
    const base = getItemQty(item.quantity) * item.price;
    const disc = base * ((Number(item.discountPercent) || 0) / 100);
    const taxable = base - disc;
    return sum + (taxable * (item.taxRate / 100));
  }, 0);
  const formTotalAmount = formSubTotal + formTaxAmount;

  const resetForm = () => {
    setSelectedClientId('');
    setIsCreatingClient(false);
    setDocNumber('');
    setCurrency('INR');
    setNotes('');
    setDateVal('');
    setLogoUrl('');
    setEditingDoc(null);
    setQuotationRef('');
    setProformaRef('');
    setImportSource('NONE');
    setInitialPayment(0);
    setInitialPaymentMode('CASH');
    setInitialPaymentRef('');
    setItems([{ description: '', quantity: 1, price: 0, taxRate: 18, hsnSac: '998311', discountPercent: 0 }]);
    setNewClientData({
      name: '',
      email: '',
      billingAddress: '',
      taxId: '',
      gstin: '',
      pan: '',
    });
  };

  const openModal = (type: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE') => {
    setDocType(type);
    resetForm();
    setEditingDoc(null);
    setLogoUrl('');
    
    const listLen = type === 'QUOTATION' ? quotations.length : type === 'PROFORMA' ? proformas.length : invoices.length;
    const nextNum = String(listLen + 1).padStart(3, '0');
    const fy = getFinancialYear();
    const prefix = type === 'QUOTATION' ? 'CFS-QT' : type === 'PROFORMA' ? 'CFS-PRO' : 'CFS-INV';
    setDocNumber(`${fy}/${prefix}-${nextNum}`);
    setIsModalOpen(true);
  };

  const handleImportQuotation = (qId: string) => {
    setQuotationRef(qId);
    if (!qId) return;
    const q = quotations.find((item: any) => (item.id || item._id) === qId);
    if (q) {
      setSelectedClientId(q.clientRef?.id || q.clientRef || '');
      setCurrency(q.currency);
      setNotes(q.notes || '');
      setLogoUrl((q as any).logoUrl || '');
      setProformaRef('');
      setItems((q.items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        hsnSac: item.hsnSac || '998311',
        discountPercent: item.discountPercent || 0
      })));
    }
  };

  const handleImportProforma = (pId: string) => {
    setProformaRef(pId);
    if (!pId) return;
    const p = proformas.find((item: any) => (item.id || item._id) === pId);
    if (p) {
      setSelectedClientId(p.clientRef?.id || p.clientRef || '');
      setCurrency(p.currency);
      setNotes(p.notes || '');
      setLogoUrl((p as any).logoUrl || '');
      setQuotationRef(p.quotationRef || '');
      setItems((p.items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        hsnSac: item.hsnSac || '998311',
        discountPercent: item.discountPercent || 0
      })));
    }
  };

  const openEditModal = (doc: Quotation | ProformaInvoice | FinalInvoice) => {
    setEditingDoc(doc);
    setDocType(doc.documentType);
    setSelectedClientId(doc.clientRef?.id || doc.clientRef || '');
    setDocNumber(doc.documentNumber || (doc as any).quoteNumber || (doc as any).proformaNumber || (doc as any).invoiceNumber || '');
    setCurrency(doc.currency);
    setNotes(doc.notes || '');
    setLogoUrl((doc as any).logoUrl || '');
    setQuotationRef(doc.quotationRef || '');
    setProformaRef((doc as any).proformaRef || '');
    if ((doc as any).proformaRef) {
      setImportSource('PROFORMA');
    } else if (doc.quotationRef) {
      setImportSource('QUOTATION');
    } else {
      setImportSource('NONE');
    }
    
    const dateLimit = doc.documentType === 'FINAL_INVOICE' ? (doc as any).dueDate : (doc as any).validUntil;
    if (dateLimit) {
      const d = new Date(dateLimit);
      const formattedDate = d.toISOString().split('T')[0];
      setDateVal(formattedDate);
    } else {
      setDateVal('');
    }
    
    setItems((doc.items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      taxRate: item.taxRate,
      hsnSac: item.hsnSac || '998311',
      discountPercent: item.discountPercent || 0
    })));
    
    setIsModalOpen(true);
  };

  const checkSubscriptionStatus = () => {
    if (tenantProfile?.subscriptionStatus === 'EXPIRED') {
      alert('Subscription Expired: Your workspace is in Read-Only Mode. Please renew your subscription to perform this action.');
      return false;
    }
    return true;
  };

  const handleDeleteDoc = async (id: string, type: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE') => {
    if (!checkSubscriptionStatus()) return;
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      if (type === 'QUOTATION') {
        await deleteQuotation.mutateAsync(id);
      } else if (type === 'PROFORMA') {
        await deleteProforma.mutateAsync(id);
      } else {
        await deleteInvoice.mutateAsync(id);
      }
      alert('Document deleted successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const handleCreateClient = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkSubscriptionStatus()) return;
    if (!newClientData.name || !newClientData.email) {
      alert('Name and Email are required.');
      return;
    }
    try {
      const clientPayload = {
        ...newClientData,
        taxId: newClientData.taxId || newClientData.gstin || newClientData.pan || 'N/A',
        billingAddress: newClientData.billingAddress || 'N/A'
      };
      const created = await createClientMutation.mutateAsync(clientPayload);
      const createdId = created.id || (created as any)._id;
      setSelectedClientId(createdId);
      setIsCreatingClient(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to register client.');
    }
  };

  const handleConvertQuote = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    try {
      await convertQuote.mutateAsync(id);
      alert('Quotation converted to Proforma Invoice successfully!');
      if (printDoc && (printDoc.id === id || (printDoc as any)._id === id)) {
        setPrintDoc(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert quotation.');
    }
  };

  const handleConvertQuoteToInvoiceDirect = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    try {
      await convertQuoteToInvoice.mutateAsync(id);
      alert('Quotation converted directly to Final Invoice successfully!');
      if (printDoc && (printDoc.id === id || (printDoc as any)._id === id)) {
        setPrintDoc(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert quotation.');
    }
  };

  const handleConvertProforma = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    try {
      await convertProforma.mutateAsync(id);
      alert('Proforma Invoice converted to Final Invoice successfully!');
      if (printDoc && (printDoc.id === id || (printDoc as any)._id === id)) {
        setPrintDoc(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert proforma invoice.');
    }
  };

  const handleUpdateQuoteStatus = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    if (!checkSubscriptionStatus()) return;
    try {
      await updateQuotation.mutateAsync({ id, data: { status } });
      alert(`Quotation status updated to ${status}!`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkSubscriptionStatus()) return;

    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }
    if (!dateVal) {
      alert(docType === 'FINAL_INVOICE' ? 'Please select Due Date' : 'Please select Valid Until date');
      return;
    }
    if (items.some(i => !i.description.trim() || i.price <= 0)) {
      alert('Please provide valid description and positive price for all items');
      return;
    }

    const selectedClient = clients.find((c: any) => (c.id || c._id) === selectedClientId);
    if (!selectedClient) {
      alert('Selected client not found');
      return;
    }

    const mappedItems = items.map(i => ({
      description: i.description,
      quantity: getItemQty(i.quantity),
      price: Number(i.price),
      taxRate: Number(i.taxRate),
      hsnSac: i.hsnSac || '998311',
      discountPercent: Number(i.discountPercent) || 0
    }));

    try {
      if (editingDoc) {
        const docId = editingDoc.id || (editingDoc as any)._id;
        if (docType === 'QUOTATION') {
          const payload = {
            documentType: 'QUOTATION' as const,
            documentNumber: docNumber,
            quoteNumber: docNumber,
            clientRef: selectedClientId,
            clientInfo: {
              name: selectedClient.name,
              email: selectedClient.email,
              billingAddress: selectedClient.billingAddress || '',
              taxId: selectedClient.taxId || '',
              gstin: selectedClient.gstin || '',
              pan: selectedClient.pan || '',
            },
            items: mappedItems,
            currency: currency,
            notes: notes,
            validUntil: new Date(dateVal),
            logoUrl: logoUrl || undefined,
          };
          await updateQuotation.mutateAsync({ id: docId, data: payload as any });
        } else if (docType === 'PROFORMA') {
          const payload = {
            documentType: 'PROFORMA' as const,
            documentNumber: docNumber,
            proformaNumber: docNumber,
            clientRef: selectedClientId,
            clientInfo: {
              name: selectedClient.name,
              email: selectedClient.email,
              billingAddress: selectedClient.billingAddress || '',
              taxId: selectedClient.taxId || '',
              gstin: selectedClient.gstin || '',
              pan: selectedClient.pan || '',
            },
            items: mappedItems,
            currency: currency,
            notes: notes,
            validUntil: new Date(dateVal),
            logoUrl: logoUrl || undefined,
            quotationRef: quotationRef || undefined,
          };
          await updateProforma.mutateAsync({ id: docId, data: payload as any });
        } else {
          const payload = {
            documentType: 'FINAL_INVOICE' as const,
            documentNumber: docNumber,
            invoiceNumber: docNumber,
            clientRef: selectedClientId,
            clientInfo: {
              name: selectedClient.name,
              email: selectedClient.email,
              billingAddress: selectedClient.billingAddress || '',
              taxId: selectedClient.taxId || '',
              gstin: selectedClient.gstin || '',
              pan: selectedClient.pan || '',
            },
            items: mappedItems,
            currency: currency,
            notes: notes,
            dueDate: new Date(dateVal),
            logoUrl: logoUrl || undefined,
            quotationRef: quotationRef || undefined,
            proformaRef: proformaRef || undefined,
          };
          await updateInvoice.mutateAsync({ id: docId, data: payload as any });
        }
        alert('Document updated successfully!');
      } else {
        if (docType === 'QUOTATION') {
          const payload = {
            documentType: 'QUOTATION' as const,
            documentNumber: docNumber,
            quoteNumber: docNumber,
            clientRef: selectedClientId,
            clientInfo: {
              name: selectedClient.name,
              email: selectedClient.email,
              billingAddress: selectedClient.billingAddress || '',
              taxId: selectedClient.taxId || '',
              gstin: selectedClient.gstin || '',
              pan: selectedClient.pan || '',
            },
            items: mappedItems,
            currency: currency,
            notes: notes,
            status: 'DRAFT' as const,
            issueDate: new Date(),
            validUntil: new Date(dateVal),
            logoUrl: logoUrl || undefined,
          };
          await createQuotation.mutateAsync(payload);
        } else if (docType === 'PROFORMA') {
          const payload = {
            documentType: 'PROFORMA' as const,
            documentNumber: docNumber,
            proformaNumber: docNumber,
            clientRef: selectedClientId,
            clientInfo: {
              name: selectedClient.name,
              email: selectedClient.email,
              billingAddress: selectedClient.billingAddress || '',
              taxId: selectedClient.taxId || '',
              gstin: selectedClient.gstin || '',
              pan: selectedClient.pan || '',
            },
            items: mappedItems,
            currency: currency,
            notes: notes,
            status: 'DRAFT' as const,
            issueDate: new Date(),
            validUntil: new Date(dateVal),
            logoUrl: logoUrl || undefined,
            quotationRef: quotationRef || undefined,
          };
          await createProforma.mutateAsync(payload);
        } else {
          const payload = {
            documentType: 'FINAL_INVOICE' as const,
            documentNumber: docNumber,
            invoiceNumber: docNumber,
            clientRef: selectedClientId,
            clientInfo: {
              name: selectedClient.name,
              email: selectedClient.email,
              billingAddress: selectedClient.billingAddress || '',
              taxId: selectedClient.taxId || '',
              gstin: selectedClient.gstin || '',
              pan: selectedClient.pan || '',
            },
            items: mappedItems,
            currency: currency,
            notes: notes,
            status: 'DRAFT' as const,
            issueDate: new Date(),
            dueDate: new Date(dateVal),
            paidAmount: Number(initialPayment) || 0,
            paymentMode: initialPaymentMode,
            paymentReference: initialPaymentRef,
            paymentStatus: (Number(initialPayment) >= formTotalAmount) ? 'PAID' as const : (Number(initialPayment) > 0 ? 'PARTIALLY_PAID' as const : 'UNPAID' as const),
            logoUrl: logoUrl || undefined,
            quotationRef: quotationRef || undefined,
            proformaRef: proformaRef || undefined,
          };
          await createInvoice.mutateAsync(payload as any);
        }
        alert('Document created successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save document.');
    }
  };

  const isSaving = createQuotation.isPending || createProforma.isPending || createInvoice.isPending || updateQuotation.isPending || updateProforma.isPending || updateInvoice.isPending;

  return (
    <div className="app-container">
      <DashboardHeader 
        tenantProfile={tenantProfile}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isApiError={isApiError}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRenewal={() => setIsRenewalOpen(true)}
        clients={clients}
        setSelectedLedgerClientId={setSelectedLedgerClientId}
        selectedLedgerClientId={selectedLedgerClientId}
      />

      {/* Global Search Bar & Filters (Only in History mode) */}
      {viewMode === 'history' && (
        <div className="search-bar-container">
          <div className="search-field-query">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
              Search Query
            </label>
            <input 
              type="text" 
              placeholder="🔍 Search history by Document #, Client name or email..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                padding: '0.65rem 1rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="search-field-date">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
              Start Date
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                colorScheme: 'light'
              }}
            />
          </div>

          <div className="search-field-date">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
              End Date
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                colorScheme: 'light'
              }}
            />
          </div>

          <div className="search-actions">
            <button 
              type="button" 
              onClick={() => setIsExcelPreviewOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              📊 Live Excel Preview
            </button>
            <button 
              type="button" 
              onClick={handleExportToExcel}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              📥 Export to Excel
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'ledger' ? (
        <ClientLedgerSection 
          selectedLedgerClientId={selectedLedgerClientId}
          setSelectedLedgerClientId={setSelectedLedgerClientId}
          clients={clients}
          ledgerData={ledgerData}
          loadingLedger={loadingLedger}
          onOpenRecordPayment={() => {
            setPaymentModalData({
              clientId: selectedLedgerClientId,
              invoiceId: '',
              invoiceNumber: '',
              amount: 0,
              type: 'ADVANCE_PAYMENT',
              paymentMode: 'CASH',
              referenceNo: '',
              notes: '',
            });
            setIsRecordPaymentModalOpen(true);
          }}
        />
      ) : viewMode === 'subscription' ? (
        <SubscriptionSection 
          tenantProfile={tenantProfile}
          dynamicPlansMap={dynamicPlansMap}
          onOpenRenewal={() => setIsRenewalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectPlan={(planId) => {
            setSelectedPlan(planId);
            setIsRenewalOpen(true);
          }}
        />
      ) : (
        <>
          <DashboardStats 
            viewMode={viewMode}
            activeQuoteCount={activeQuoteCount}
            activeProformaCount={activeProformaCount}
            activeInvoiceCount={activeInvoiceCount}
            activeQuoteVolume={activeQuoteVolume}
            activeProformaVolume={activeProformaVolume}
            activeInvoiceVolume={activeInvoiceVolume}
          />

          <section className="lists-container">
            <QuotationsSection 
              viewMode={viewMode}
              loadingQuotes={loadingQuotes}
              quotations={filteredQuotes as Quotation[]}
              onOpenCreateModal={() => openModal('QUOTATION')}
              onSetPrintDoc={(doc) => setPrintDoc(doc)}
              onDownloadHtml={handleDownloadHtml}
              onOpenEditModal={openEditModal}
              onDeleteDoc={(id) => handleDeleteDoc(id, 'QUOTATION')}
              onConvertQuote={handleConvertQuote}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
            />

            <ProformaSection 
              viewMode={viewMode}
              loadingProformas={loadingProformas}
              proformas={filteredProformas as ProformaInvoice[]}
              onOpenCreateModal={() => openModal('PROFORMA')}
              onSetPrintDoc={(doc) => setPrintDoc(doc)}
              onDownloadHtml={handleDownloadHtml}
              onOpenEditModal={openEditModal}
              onDeleteDoc={(id) => handleDeleteDoc(id, 'PROFORMA')}
              onConvertProforma={handleConvertProforma}
            />

            <InvoicesSection 
              viewMode={viewMode}
              loadingInvoices={loadingInvoices}
              invoices={filteredInvoices as FinalInvoice[]}
              onOpenCreateModal={() => openModal('FINAL_INVOICE')}
              onSetPrintDoc={(doc) => setPrintDoc(doc)}
              onDownloadHtml={handleDownloadHtml}
              onOpenEditModal={openEditModal}
              onDeleteDoc={(id) => handleDeleteDoc(id, 'FINAL_INVOICE')}
              onRecordPayment={(i) => {
                setPaymentModalData({
                  clientId: i.clientRef?.id || i.clientRef || '',
                  invoiceId: i.id || (i as any)._id,
                  invoiceNumber: i.documentNumber || i.invoiceNumber || '',
                  amount: Math.max(0, Number((i.totalAmount - ((i as any).paidAmount || 0)).toFixed(2))),
                  type: 'PAYMENT_RECEIVED',
                  paymentMode: 'CASH',
                  referenceNo: '',
                  notes: '',
                });
                setIsRecordPaymentModalOpen(true);
              }}
            />
          </section>
        </>
      )}

      {/* Modals */}
      <CreateDocumentModal 
        isOpen={isModalOpen}
        docType={docType}
        editingDoc={editingDoc}
        docNumber={docNumber}
        setDocNumber={setDocNumber}
        dateVal={dateVal}
        setDateVal={setDateVal}
        currency={currency}
        setCurrency={setCurrency}
        notes={notes}
        setNotes={setNotes}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        clients={clients}
        isCreatingClient={isCreatingClient}
        setIsCreatingClient={setIsCreatingClient}
        newClientData={newClientData}
        setNewClientData={setNewClientData}
        handleCreateClient={handleCreateClient}
        quotationRef={quotationRef}
        setQuotationRef={setQuotationRef}
        proformaRef={proformaRef}
        setProformaRef={setProformaRef}
        importSource={importSource}
        handleImportSourceChange={handleImportSourceChange}
        handleImportQuotation={handleImportQuotation}
        handleImportProforma={handleImportProforma}
        quotations={quotations}
        proformas={proformas}
        items={items}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        handleItemChange={handleItemChange}
        getItemQty={getItemQty}
        formSubTotal={formSubTotal}
        formTaxAmount={formTaxAmount}
        formTotalAmount={formTotalAmount}
        initialPayment={initialPayment}
        setInitialPayment={setInitialPayment}
        initialPaymentMode={initialPaymentMode}
        setInitialPaymentMode={setInitialPaymentMode}
        initialPaymentRef={initialPaymentRef}
        setInitialPaymentRef={setInitialPaymentRef}
        isSaving={isSaving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveDocument}
      />

      {isRenewalOpen && (
        <SubscriptionModal 
          tenantProfile={tenantProfile}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          renewalUtr={renewalUtr}
          setRenewalUtr={setRenewalUtr}
          renewalLoading={renewalLoading}
          renewalStatus={renewalStatus}
          dynamicPlansMap={dynamicPlansMap}
          onClose={() => setIsRenewalOpen(false)}
          onSubmit={handleRenewalSubmit}
        />
      )}

      {isSettingsOpen && (
        <TenantSettingsModal 
          tenantProfile={tenantProfile}
          settingsData={settingsData}
          setSettingsData={setSettingsData}
          onLogoUpload={handleWorkspaceLogoUpload}
          onSignatureUpload={handleWorkspaceSignatureUpload}
          onClose={() => setIsSettingsOpen(false)}
          onSubmit={handleSettingsSubmit}
        />
      )}

      {isRecordPaymentModalOpen && (
        <RecordPaymentModal 
          paymentModalData={paymentModalData}
          setPaymentModalData={setPaymentModalData}
          isPending={recordPaymentMutation.isPending}
          onClose={() => setIsRecordPaymentModalOpen(false)}
          onSubmit={async (e) => {
            e.preventDefault();
            if (paymentModalData.amount <= 0) {
              alert('Please enter a valid payment amount greater than 0');
              return;
            }
            try {
              await recordPaymentMutation.mutateAsync({
                clientId: paymentModalData.clientId,
                invoiceId: paymentModalData.invoiceId || null,
                amount: Number(paymentModalData.amount),
                type: paymentModalData.type,
                paymentMode: paymentModalData.paymentMode,
                referenceNo: paymentModalData.referenceNo || null,
                notes: paymentModalData.notes || null
              });
              alert('Payment recorded successfully!');
              setIsRecordPaymentModalOpen(false);
            } catch (err: any) {
              alert(err.response?.data?.message || 'Failed to record payment');
            }
          }}
        />
      )}

      {isExcelPreviewOpen && (
        <ExcelPreviewModal 
          excelPreviewTab={excelPreviewTab}
          setExcelPreviewTab={setExcelPreviewTab}
          quotations={filteredQuotes as Quotation[]}
          proformas={filteredProformas as ProformaInvoice[]}
          invoices={filteredInvoices as FinalInvoice[]}
          onExportToExcel={handleExportToExcel}
          onClose={() => setIsExcelPreviewOpen(false)}
        />
      )}

      {printDoc && (
        <PrintPreviewModal 
          printDoc={printDoc}
          tenantProfile={tenantProfile}
          quotations={quotations}
          proformas={proformas}
          invoices={invoices}
          onConvertQuote={handleConvertQuote}
          onConvertQuoteToInvoiceDirect={handleConvertQuoteToInvoiceDirect}
          onConvertProforma={handleConvertProforma}
          onDownloadHtml={handleDownloadHtml}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
}
