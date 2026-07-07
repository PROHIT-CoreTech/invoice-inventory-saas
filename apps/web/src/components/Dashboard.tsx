import React, { useState, useRef, useEffect } from 'react';
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
} from '@procash-invoices/api-client';
import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';
import { generateDocumentHtml } from '@procash-invoices/document-templates';
import ExcelJS from 'exceljs';

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

  const [tenantProfile, setTenantProfile] = useState<any>(null);

  // Workspace Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Expiration Renewal Modal States
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [renewalUtr, setRenewalUtr] = useState('');
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalStatus, setRenewalStatus] = useState('');

  const getPlanPriceNum = (planId: string) => {
    switch (planId) {
      case '1_MONTH': return 999;
      case '6_MONTHS': return 4999;
      case '1_YEAR': return 9999;
      case 'LIFETIME': return 20000;
      default: return 999;
    }
  };

  const getRenewalUpiUrl = () => {
    if (!tenantProfile) return '';
    const formattedTenant = tenantProfile.tenantId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const planId = tenantProfile.subscriptionPlan || '1_MONTH';
    
    let planCode = 'MON';
    if (planId === '6_MONTHS') planCode = 'PRO';
    else if (planId === '1_YEAR') planCode = 'ENT';
    else if (planId === 'LIFETIME') planCode = 'LIF';

    const tn = `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
    const amount = getPlanPriceNum(planId);
    
    return `upi://pay?pa=rohitbarge22-3@okaxis&pn=ROHIT%20BARGE&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(tn)}`;
  };

  const getRenewalUpiNote = () => {
    if (!tenantProfile) return '';
    const formattedTenant = tenantProfile.tenantId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const planId = tenantProfile.subscriptionPlan || '1_MONTH';
    let planCode = 'MON';
    if (planId === '6_MONTHS') planCode = 'PRO';
    else if (planId === '1_YEAR') planCode = 'ENT';
    else if (planId === 'LIFETIME') planCode = 'LIF';
    return `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
  };

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
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api') + '/subscriptions/submit-payment';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          planTier: tenantProfile?.subscriptionPlan || '1_MONTH',
          amountPaid: getPlanPriceNum(tenantProfile?.subscriptionPlan || '1_MONTH'),
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
      setRenewalLoading(false);
    }
  };
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

  const getPlanLabel = (planId: string | undefined | null) => {
    switch (planId) {
      case 'TRIAL': return '10-Day Free Trial';
      case '1_MONTH': return 'Monthly Starter';
      case '6_MONTHS': return '6 Months Pro';
      case '1_YEAR': return '1 Year Enterprise';
      case 'LIFETIME': return 'Lifetime Unlimited';
      case 'FREE': return 'Free Tier';
      default: return 'Free Tier';
    }
  };

  const getPlanPrice = (planId: string | undefined | null) => {
    switch (planId) {
      case 'TRIAL': return '₹0';
      case '1_MONTH': return '₹999';
      case '6_MONTHS': return '₹4,999';
      case '1_YEAR': return '₹9,999';
      case 'LIFETIME': return '₹20,000';
      case 'FREE': return '₹0';
      default: return '₹0';
    }
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
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
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api') + '/tenant-profile';
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
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api') + '/tenant-profile';
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

  const isApiError = errorQuotes || errorProformas || errorInvoices;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState<'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE'>('QUOTATION');
  const [printDoc, setPrintDoc] = useState<Quotation | ProformaInvoice | FinalInvoice | null>(null);
  const [editingDoc, setEditingDoc] = useState<Quotation | ProformaInvoice | FinalInvoice | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getFinancialYear = (date: Date = new Date()) => {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-indexed, April is 3
    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const endYear = (startYear + 1) % 100;
    return `${startYear}-${String(endYear).padStart(2, '0')}`;
  };

  const getDocumentData = (doc: Quotation | ProformaInvoice | FinalInvoice) => {
    return {
      documentType: doc.documentType,
      documentNumber: doc.documentNumber || (doc as any).quoteNumber || (doc as any).proformaNumber || (doc as any).invoiceNumber || '',
      issueDate: doc.issueDate,
      dueDate: (doc as any).dueDate,
      validUntil: (doc as any).validUntil,
      clientInfo: {
        name: doc.clientInfo?.name || '',
        email: doc.clientInfo?.email,
        billingAddress: doc.clientInfo?.billingAddress,
        billingAndShippingAddress: doc.clientInfo?.billingAddress,
        gstin: doc.clientInfo?.gstin,
        stateName: (doc.clientInfo as any)?.stateName || 'Maharashtra',
        stateCode: (doc.clientInfo as any)?.stateCode || '27',
      },
      items: (doc.items || []).map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        hsnSac: (item as any).hsnSac || '998311',
        per: (item as any).per || 'nos',
        discountPercent: (item as any).discountPercent || 0,
      })),
      notes: doc.notes,
      currency: doc.currency,
      applyGst: (doc as any).applyGst !== false,
      logoUrl: tenantProfile?.logoUrl || (doc as any).logoUrl || `${window.location.origin}/images/hero.png`,
      tenantProfile: tenantProfile || undefined,
    };
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    if (printDoc) {
      const docNum = printDoc.documentNumber || (printDoc as any).quoteNumber || (printDoc as any).proformaNumber || (printDoc as any).invoiceNumber || '';
      // Replace '/' with '-' to avoid path issues on macOS/Linux
      const safeNum = docNum.replace(/\//g, '-');
      if (safeNum) {
        document.title = safeNum;
      }
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        if (iframeDoc) {
          iframeDoc.title = document.title;
        }
      } catch (e) {
        console.error(e);
      }
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleDownloadHtml = (doc: any) => {
    const docData = getDocumentData(doc);
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

  // Daily Mode & History States
  const [viewMode, setViewMode] = useState<'daily' | 'history'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
  const [excelPreviewTab, setExcelPreviewTab] = useState<'Quotations' | 'Proformas' | 'Final Invoices'>('Quotations');

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
  const [items, setItems] = useState<Array<{ description: string; quantity: number | undefined; price: number; taxRate: number; hsnSac: string; discountPercent?: number }>>([
    { description: '', quantity: 1, price: 0, taxRate: 18, hsnSac: '998311', discountPercent: 0 }
  ]);
  const [quotationRef, setQuotationRef] = useState('');
  const [proformaRef, setProformaRef] = useState('');

  // Date and Search Helpers
  const isToday = (dateStr?: Date | string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const filterBySearchAndDate = (list: any[]) => {
    let filtered = list;
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const docNum = (item.documentNumber || item.quoteNumber || item.proformaNumber || item.invoiceNumber || '').toLowerCase();
        const clientName = (item.clientInfo?.name || '').toLowerCase();
        const clientEmail = (item.clientInfo?.email || '').toLowerCase();
        return docNum.includes(query) || clientName.includes(query) || clientEmail.includes(query);
      });
    }
    
    // Date range filter
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

  // Aggregate values for display
  const totalQuoteVolume = (quotations as Quotation[]).reduce((sum: number, q: Quotation) => sum + (q.totalAmount || 0), 0);
  const totalProformaVolume = (proformas as ProformaInvoice[]).reduce((sum: number, p: ProformaInvoice) => sum + (p.totalAmount || 0), 0);
  const totalInvoiceVolume = (invoices as FinalInvoice[]).reduce((sum: number, i: FinalInvoice) => sum + (i.totalAmount || 0), 0);

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Configure default properties
    workbook.creator = 'PROCash Invoices';
    workbook.lastModifiedBy = 'PROCash Invoices';
    workbook.created = new Date();
    workbook.modified = new Date();

    const generateSheet = (sheetName: string, title: string, headers: string[], rows: any[]) => {
      const sheet = workbook.addWorksheet(sheetName, {
        views: [{ showGridLines: true }] // Ensure grid lines are visible
      });

      // 1. Add Title row
      sheet.addRow([title]);
      const titleCell = sheet.getCell('A1');
      titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF4F46E5' } };
      sheet.getRow(1).height = 35;
      sheet.mergeCells(1, 1, 1, headers.length); // Merge across header length

      // Blank space
      sheet.addRow([]);
      sheet.getRow(2).height = 15;

      // 2. Add Header row
      sheet.addRow(headers);
      const headerRow = sheet.getRow(3);
      headerRow.height = 25;
      
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF312E81' } },
          bottom: { style: 'thin', color: { argb: 'FF312E81' } },
          left: { style: 'thin', color: { argb: 'FF312E81' } },
          right: { style: 'thin', color: { argb: 'FF312E81' } }
        };
      });

      // 3. Add Data rows
      if (rows.length === 0) {
        sheet.addRow(['No records found']);
        sheet.mergeCells(4, 1, 4, headers.length);
        const emptyCell = sheet.getCell('A4');
        emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
        emptyCell.font = { name: 'Segoe UI', italic: true };
        sheet.getRow(4).height = 22;
      } else {
        rows.forEach((rowData) => {
          const r = sheet.addRow(rowData);
          r.height = 22;
          
          r.eachCell((cell, colNumber) => {
            cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
            };

            // Format numbers to align Right
            if (typeof cell.value === 'number') {
              cell.alignment = { horizontal: 'right', vertical: 'middle' };
              if (colNumber >= 6 && colNumber <= 8) {
                cell.numFmt = '"₹"#,##0.00'; // Format as INR Currency
              }
            } else {
              cell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
          });
        });
      }

      // 4. Set Column Widths dynamically
      const colWidths = [20, 25, 25, 15, 15, 18, 18, 18, 15];
      colWidths.forEach((width, index) => {
        const col = sheet.getColumn(index + 1);
        if (col) col.width = width;
      });
    };

    // 1. Prepare data rows for Quotations
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

    // 2. Prepare data rows for Proformas
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

    // 3. Prepare data rows for Final Invoices
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

    // Generate sheets
    generateSheet(
      'Quotations',
      'Quotations Billing Archive Report',
      ['Quote Number', 'Client Name', 'Client Email', 'Date', 'Valid Until', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status'],
      quotesData
    );

    generateSheet(
      'Proformas',
      'Proforma Invoices Billing Archive Report',
      ['Proforma Number', 'Client Name', 'Client Email', 'Date', 'Due Date', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status'],
      proformasData
    );

    generateSheet(
      'Final Invoices',
      'Final Invoices Billing Archive Report',
      ['Invoice Number', 'Client Name', 'Client Email', 'Date', 'Due Date', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status'],
      invoicesData
    );

    // Save workbook binary file
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

  const todayQuoteVolume = (quotations as Quotation[]).filter((q: any) => isToday(q.createdAt || q.issueDate)).reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const todayProformaVolume = (proformas as ProformaInvoice[]).filter((p: any) => isToday(p.createdAt || p.issueDate)).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const todayInvoiceVolume = (invoices as FinalInvoice[]).filter((i: any) => isToday(i.createdAt || i.issueDate)).reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const activeQuoteVolume = viewMode === 'daily' ? todayQuoteVolume : totalQuoteVolume;
  const activeProformaVolume = viewMode === 'daily' ? todayProformaVolume : totalProformaVolume;
  const activeInvoiceVolume = viewMode === 'daily' ? todayInvoiceVolume : totalInvoiceVolume;

  const activeQuoteCount = viewMode === 'daily' ? filteredQuotes.length : quotations.length;
  const activeProformaCount = viewMode === 'daily' ? filteredProformas.length : proformas.length;
  const activeInvoiceCount = viewMode === 'daily' ? filteredInvoices.length : invoices.length;

  const formatCurrency = (val: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  const formatDate = (dateStr?: Date | string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderAuditTrail = (doc: any) => {
    const history: React.ReactNode[] = [];
    const docId = doc.id || doc._id;

    if (doc.documentType === 'QUOTATION') {
      const relatedProforma: any = proformas.find((p: any) => p.quotationRef === docId);
      if (relatedProforma) {
        history.push(
          <div key="to-proforma" className="audit-trail-item">
            <span>➔ Converted to Proforma Invoice:</span> <strong>{relatedProforma.documentNumber || relatedProforma.proformaNumber}</strong>
          </div>
        );
        const relatedInvoice: any = invoices.find((i: any) => i.proformaRef === relatedProforma.id || i.proformaRef === relatedProforma._id);
        if (relatedInvoice) {
          history.push(
            <div key="to-invoice" className="audit-trail-item">
              <span>➔ Converted to Final Invoice:</span> <strong>{relatedInvoice.documentNumber || relatedInvoice.invoiceNumber}</strong>
            </div>
          );
        }
      }
    } else if (doc.documentType === 'PROFORMA') {
      const relatedQuotation: any = quotations.find((q: any) => (q.id || q._id) === doc.quotationRef);
      if (relatedQuotation) {
        history.push(
          <div key="from-quote" className="audit-trail-item">
            <span>← Converted from Quotation:</span> <strong>{relatedQuotation.documentNumber || relatedQuotation.quoteNumber}</strong>
          </div>
        );
      }
      const relatedInvoice: any = invoices.find((i: any) => i.proformaRef === docId);
      if (relatedInvoice) {
        history.push(
          <div key="to-invoice" className="audit-trail-item">
            <span>➔ Converted to Final Invoice:</span> <strong>{relatedInvoice.documentNumber || relatedInvoice.invoiceNumber}</strong>
          </div>
        );
      }
    } else if (doc.documentType === 'FINAL_INVOICE') {
      const relatedProforma: any = proformas.find((p: any) => (p.id || p._id) === doc.proformaRef);
      if (relatedProforma) {
        history.push(
          <div key="from-proforma" className="audit-trail-item">
            <span>← Converted from Proforma Invoice:</span> <strong>{relatedProforma.documentNumber || relatedProforma.proformaNumber}</strong>
          </div>
        );
        const relatedQuotation: any = quotations.find((q: any) => (q.id || q._id) === relatedProforma.quotationRef);
        if (relatedQuotation) {
          history.push(
            <div key="from-quote" className="audit-trail-item">
              <span>← Source Quotation:</span> <strong>{relatedQuotation.documentNumber || relatedQuotation.quoteNumber}</strong>
            </div>
          );
        }
      }
    }

    if (history.length === 0) return null;

    return (
      <div className="audit-trail-container no-print" style={{ padding: '1rem', margin: '0 0 1rem 0' }}>
        <h4 className="audit-trail-title" style={{ color: '#eab308', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>⛓️ Document Reference History</h4>
        <div className="audit-trail-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {history}
        </div>
      </div>
    );
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
    
    // Auto-generate financial year format Document Number (e.g. 2026-27/CFS-QT-001)
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
    const q = quotations.find(item => (item.id || (item as any)._id) === qId);
    if (q) {
      setSelectedClientId(q.clientRef?.id || q.clientRef || '');
      setCurrency(q.currency);
      setNotes(q.notes || '');
      setLogoUrl((q as any).logoUrl || '');
      setProformaRef('');
      setItems((q.items || []).map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        hsnSac: (item as any).hsnSac || '998311',
        discountPercent: (item as any).discountPercent || 0
      })));
    }
  };

  const handleImportProforma = (pId: string) => {
    setProformaRef(pId);
    if (!pId) return;
    const p = proformas.find(item => (item.id || (item as any)._id) === pId);
    if (p) {
      setSelectedClientId(p.clientRef?.id || p.clientRef || '');
      setCurrency(p.currency);
      setNotes(p.notes || '');
      setLogoUrl((p as any).logoUrl || '');
      setQuotationRef(p.quotationRef || '');
      setItems((p.items || []).map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        hsnSac: (item as any).hsnSac || '998311',
        discountPercent: (item as any).discountPercent || 0
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
    
    const dateLimit = doc.documentType === 'FINAL_INVOICE' ? (doc as any).dueDate : (doc as any).validUntil;
    if (dateLimit) {
      const d = new Date(dateLimit);
      const formattedDate = d.toISOString().split('T')[0];
      setDateVal(formattedDate);
    } else {
      setDateVal('');
    }
    
    setItems((doc.items || []).map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      taxRate: item.taxRate,
      hsnSac: (item as any).hsnSac || '998311',
      discountPercent: (item as any).discountPercent || 0
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkSubscriptionStatus()) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const response = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, data: base64Data }),
        });
        if (!response.ok) throw new Error('Upload failed');
        const result = await response.json();
        setLogoUrl(result.url);
        alert('Logo uploaded successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to upload logo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateClient = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkSubscriptionStatus()) return;
    if (!newClientData.name || !newClientData.email) {
      alert('Name and Email are required.');
      return;
    }
    try {
      const created = await createClientMutation.mutateAsync(newClientData);
      const createdId = created.id || created._id;
      setSelectedClientId(createdId);
      setIsCreatingClient(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to register client.');
    }
  };

  const handleConvertQuote = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    if (!confirm('Are you sure you want to convert this quotation to a Proforma Invoice?')) return;
    try {
      await convertQuote.mutateAsync(id);
      alert('Quotation successfully converted to Proforma Invoice!');
      setPrintDoc(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert Quotation.');
    }
  };

  const handleConvertQuoteToInvoiceDirect = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    if (!confirm('Are you sure you want to convert this quotation directly to a Final Invoice (bypassing Proforma)?')) return;
    try {
      await convertQuoteToInvoice.mutateAsync(id);
      alert('Quotation successfully converted directly to Final Invoice!');
      setPrintDoc(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert Quotation.');
    }
  };

  const handleConvertProforma = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    if (!confirm('Are you sure you want to convert this Proforma Invoice to a Final Invoice?')) return;
    try {
      await convertProforma.mutateAsync(id);
      alert('Proforma Invoice successfully converted to Final Invoice!');
      setPrintDoc(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert Proforma Invoice.');
    }
  };

  const handleUpdateQuoteStatus = async (id: string, status: string) => {
    if (!checkSubscriptionStatus()) return;
    try {
      await updateQuotation.mutateAsync({ id, data: { status: status as any } });
      alert(`Quotation status updated to ${status}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update Quotation status.');
    }
  };

  const handleUpdateProformaStatus = async (id: string, status: string) => {
    if (!checkSubscriptionStatus()) return;
    try {
      await updateProforma.mutateAsync({ id, data: { status: status as any } });
      alert(`Proforma status updated to ${status}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update Proforma status.');
    }
  };

  const handleMarkInvoicePaid = async (id: string) => {
    if (!checkSubscriptionStatus()) return;
    try {
      await updateInvoice.mutateAsync({ id, data: { status: 'PAID' as any, paymentStatus: 'PAID' as any } });
      alert('Invoice successfully marked as PAID!');
    } catch (err) {
      console.error(err);
      alert('Failed to mark Invoice as paid.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkSubscriptionStatus()) return;
    if (!selectedClientId) {
      alert('Please select or register a client.');
      return;
    }
    if (!docNumber) {
      alert('Please specify a document number.');
      return;
    }
    if (!dateVal) {
      alert('Please select a validity or due date.');
      return;
    }

    const selectedClient = clients.find(c => c.id === selectedClientId || (c as any)._id === selectedClientId);
    if (!selectedClient) return;

    const mappedItems = items.map(item => ({
      description: item.description,
      quantity: item.quantity !== undefined && item.quantity !== null && String(item.quantity) !== '' ? Number(item.quantity) : undefined,
      price: Number(item.price) || 0,
      taxRate: Number(item.taxRate) || 0,
      hsnSac: item.hsnSac || '998311',
      discountPercent: Number(item.discountPercent) || 0,
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
            paymentStatus: 'UNPAID' as const,
            logoUrl: logoUrl || undefined,
            quotationRef: quotationRef || undefined,
            proformaRef: proformaRef || undefined,
          };
          await createInvoice.mutateAsync(payload);
        }
        alert('Document created successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save document.');
    }
  };

  return (
    <div className="app-container">
      {tenantProfile?.subscriptionStatus === 'EXPIRED' && (
        <div style={{
          backgroundColor: '#ef4444',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
          position: 'relative',
          zIndex: 100
        }}>
          <span>
            ⚠️ Your workspace subscription has expired. You are in **Read-Only Mode**. All creation and editing actions are locked.
          </span>
          <button
            type="button"
            onClick={() => setIsRenewalOpen(true)}
            style={{
              backgroundColor: '#fff',
              color: '#ef4444',
              border: 'none',
              padding: '0.4rem 1.25rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ⚡ Renew Subscription Now
          </button>
        </div>
      )}
      {/* Top Header */}
      <header className="header">
        <div className="logo-section">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={tenantProfile?.logoUrl || "/images/hero.png"} alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = "/images/hero.png"; }} />
            {tenantProfile?.companyName || "PROCash Invoice ERP"}
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                marginLeft: '5px'
              }}
              title="Workspace Settings"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              ⚙️
            </button>
          </h1>
          <p style={{ margin: 0 }}>{tenantProfile?.companyName ? `Invoicing & Billing Dashboard for ${tenantProfile.companyName}` : "Production-Grade Invoicing & Billing Dashboard"}</p>
          {tenantProfile && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '0.75rem',
              color: '#a5b4fc',
              fontWeight: 700,
              marginTop: '0.5rem'
            }}>
              👑 {getPlanLabel(tenantProfile.subscriptionPlan || 'FREE')} ({tenantProfile.subscriptionPlan === 'LIFETIME' ? 'Lifetime' : (tenantProfile.subscriptionPlan === 'FREE' ? 'Free Tier' : `Expires: ${formatDateTime(tenantProfile.subscriptionExpiresAt)}`)})
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="view-mode-tabs">
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'daily' ? 'active' : ''}`} 
              onClick={() => setViewMode('daily')}
            >
              📅 Daily Workspace
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'history' ? 'active' : ''}`} 
              onClick={() => setViewMode('history')}
            >
              📜 Archive & History
            </button>
          </div>
          <div className="connection-pill">
            <div className="connection-dot" style={{ backgroundColor: isApiError ? '#f87171' : '#34d399', boxShadow: isApiError ? '0 0 8px #f87171' : '0 0 8px #34d399' }} />
            <span>API: {isApiError ? 'Disconnected' : 'Connected'}</span>
          </div>
        </div>
      </header>

      {/* Global Search Bar & Filters (Only in History mode) */}
      {viewMode === 'history' && (
        <div className="search-bar-container" style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          backgroundColor: 'rgba(30, 41, 59, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '2rem'
        }}>
          {/* Search Query */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
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
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.65rem 1rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Start Date */}
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
              Start Date
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                colorScheme: 'dark'
              }}
            />
          </div>

          {/* End Date */}
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
              End Date
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                colorScheme: 'dark'
              }}
            />
          </div>

          {/* Export & Preview Buttons */}
          <div style={{ alignSelf: 'flex-end', flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              👁️ Preview Excel
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
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              📥 Export to Excel
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <section className="stats-grid">
        <div className="stat-card quotation">
          <div className="stat-header">
            <span>Quotations</span>
            <span style={{ color: 'var(--info)' }}>{activeQuoteCount} {viewMode === 'daily' ? 'Today' : 'Total'}</span>
          </div>
          <div className="stat-value">{formatCurrency(activeQuoteVolume, quotations[0]?.currency || 'INR')}</div>
          <div className="stat-footer">{viewMode === 'daily' ? "Today's pipe volume" : "Estimated sales pipe volume"}</div>
        </div>

        <div className="stat-card proforma">
          <div className="stat-header">
            <span>Proforma Invoices</span>
            <span style={{ color: 'var(--warning)' }}>{activeProformaCount} {viewMode === 'daily' ? 'Today' : 'Total'}</span>
          </div>
          <div className="stat-value">{formatCurrency(activeProformaVolume, proformas[0]?.currency || 'INR')}</div>
          <div className="stat-footer">{viewMode === 'daily' ? "Today's pending" : "Awaiting confirmations"}</div>
        </div>

        <div className="stat-card invoice">
          <div className="stat-header">
            <span>Final Invoices</span>
            <span style={{ color: 'var(--primary)' }}>{activeInvoiceCount} {viewMode === 'daily' ? 'Today' : 'Total'}</span>
          </div>
          <div className="stat-value">{formatCurrency(activeInvoiceVolume, invoices[0]?.currency || 'INR')}</div>
          <div className="stat-footer">{viewMode === 'daily' ? "Today's revenue" : "Total billed revenue"}</div>
        </div>
      </section>

      {/* Lists Section */}
      <section className="lists-container">
        {/* 1. Quotations List */}
        <div>
          <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ color: 'var(--info)' }}>●</span> {viewMode === 'daily' ? "Today's Quotations" : "Quotations Archive"}</span>
            <button className="btn-create" onClick={() => openModal('QUOTATION')}>+ Create</button>
          </h2>
          <div className="document-list">
            <div className="list-header">
              <span>Quote #</span>
              <span>Client</span>
              <span>Valid Until</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {loadingQuotes ? (
              <div className="empty-state">Loading quotations...</div>
            ) : filteredQuotes.length === 0 ? (
              <div className="empty-state">{viewMode === 'daily' ? "No quotations created today." : "No quotations found in history."}</div>
            ) : (
              (filteredQuotes as Quotation[]).map((q: Quotation) => (
                <div key={q.id || q.documentNumber || q.quoteNumber} className="list-row">
                  <span className="doc-number">{q.documentNumber || q.quoteNumber}</span>
                  <div className="client-info">
                    <span className="client-name">{q.clientInfo.name}</span>
                    <span className="client-email">{q.clientInfo.email}</span>
                  </div>
                  <span className="doc-date">{formatDate(q.validUntil)}</span>
                  <span className="doc-amount">{formatCurrency(q.totalAmount, q.currency)}</span>
                  <div>
                    <span className={`status-badge ${q.status.toLowerCase()}`}>{q.status}</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button className="btn-print" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} title="View Quotation" onClick={() => setPrintDoc(q)}>👁️</button>
                      <button className="btn-print" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Download HTML" onClick={() => handleDownloadHtml(q)}>📥</button>
                      <button className="btn-status-action text-info" title="Edit Quotation" onClick={() => openEditModal(q)}>✏️</button>
                      <button className="btn-status-action text-danger" title="Delete Quotation" onClick={() => handleDeleteDoc(q.id || (q as any)._id, 'QUOTATION')}>🗑️</button>
                      {q.status !== 'CONVERTED' && q.status !== 'DECLINED' && (
                        <>
                          <button className="btn-status-action text-success" title="Accept & Convert to Proforma" onClick={() => handleConvertQuote(q.id || (q as any)._id)}>✅</button>
                          <button className="btn-status-action text-danger" title="Decline Quote" onClick={() => handleUpdateQuoteStatus(q.id || (q as any)._id, 'DECLINED')}>❌</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Proforma Invoices List */}
        <div>
          <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ color: 'var(--warning)' }}>●</span> {viewMode === 'daily' ? "Today's Proformas" : "Proformas Archive"}</span>
            <button className="btn-create" onClick={() => openModal('PROFORMA')}>+ Create</button>
          </h2>
          <div className="document-list">
            <div className="list-header">
              <span>Proforma #</span>
              <span>Client</span>
              <span>Valid Until</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {loadingProformas ? (
              <div className="empty-state">Loading proforma invoices...</div>
            ) : filteredProformas.length === 0 ? (
              <div className="empty-state">{viewMode === 'daily' ? "No proforma invoices created today." : "No proforma invoices found in history."}</div>
            ) : (
              (filteredProformas as ProformaInvoice[]).map((p: ProformaInvoice) => (
                <div key={p.id || p.documentNumber || p.proformaNumber} className="list-row">
                  <span className="doc-number">{p.documentNumber || p.proformaNumber}</span>
                  <div className="client-info">
                    <span className="client-name">{p.clientInfo.name}</span>
                    <span className="client-email">{p.clientInfo.email}</span>
                  </div>
                  <span className="doc-date">{formatDate(p.validUntil)}</span>
                  <span className="doc-amount">{formatCurrency(p.totalAmount, p.currency)}</span>
                  <div>
                    <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button className="btn-print" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} title="View Proforma" onClick={() => setPrintDoc(p)}>👁️</button>
                      <button className="btn-print" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Download HTML" onClick={() => handleDownloadHtml(p)}>📥</button>
                      <button className="btn-status-action text-info" title="Edit Proforma" onClick={() => openEditModal(p)}>✏️</button>
                      <button className="btn-status-action text-danger" title="Delete Proforma" onClick={() => handleDeleteDoc(p.id || (p as any)._id, 'PROFORMA')}>🗑️</button>
                      {p.status !== 'CONVERTED' && (
                        <button className="btn-status-action text-success" title="Confirm Payment & Convert to Invoice" onClick={() => handleConvertProforma(p.id || (p as any)._id)}>✅</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Final Invoices List */}
        <div>
          <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ color: 'var(--primary)' }}>●</span> {viewMode === 'daily' ? "Today's Final Invoices" : "Final Invoices Archive"}</span>
            <button className="btn-create" onClick={() => openModal('FINAL_INVOICE')}>+ Create</button>
          </h2>
          <div className="document-list">
            <div className="list-header">
              <span>Invoice #</span>
              <span>Client</span>
              <span>Due Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {loadingInvoices ? (
              <div className="empty-state">Loading final invoices...</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="empty-state">{viewMode === 'daily' ? "No final invoices created today." : "No final invoices found in history."}</div>
            ) : (
              (filteredInvoices as FinalInvoice[]).map((i: FinalInvoice) => (
                <div key={i.id || i.documentNumber || i.invoiceNumber} className="list-row">
                  <span className="doc-number">{i.documentNumber || i.invoiceNumber}</span>
                  <div className="client-info">
                    <span className="client-name">{i.clientInfo.name}</span>
                    <span className="client-email">{i.clientInfo.email}</span>
                  </div>
                  <span className="doc-date">{formatDate(i.dueDate)}</span>
                  <span className="doc-amount">{formatCurrency(i.totalAmount, i.currency)}</span>
                  <div>
                    <span className={`status-badge ${i.status.toLowerCase()}`}>{i.status}</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button className="btn-print" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} title="View Invoice" onClick={() => setPrintDoc(i)}>👁️</button>
                      <button className="btn-print" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Download HTML" onClick={() => handleDownloadHtml(i)}>📥</button>
                      <button className="btn-status-action text-info" title="Edit Invoice" onClick={() => openEditModal(i)}>✏️</button>
                      <button className="btn-status-action text-danger" title="Delete Invoice" onClick={() => handleDeleteDoc(i.id || (i as any)._id, 'FINAL_INVOICE')}>🗑️</button>
                      {i.status !== 'PAID' && (
                        <button className="btn-status-action text-success" title="Mark Paid" onClick={() => handleMarkInvoicePaid(i.id || (i as any)._id)}>💰</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FLOATING CREATION/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleSubmit} className="modal-card">
            <div className="modal-header">
              <h3>{editingDoc ? 'Edit' : 'Create New'} {docType === 'QUOTATION' ? 'Quotation' : docType === 'PROFORMA' ? 'Proforma Invoice' : 'Final Invoice'}</h3>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
                {/* Import from existing documents (Only on creation) */}
                {!editingDoc && (docType === 'PROFORMA' || docType === 'FINAL_INVOICE') && (
                  <div className="form-row" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                    {docType === 'PROFORMA' && (
                      <div className="form-group">
                        <label>Import details from Quotation</label>
                        <select
                          className="form-select"
                          value={quotationRef}
                          onChange={(e) => handleImportQuotation(e.target.value)}
                        >
                          <option value="">-- Select Quotation to Import --</option>
                          {quotations.map(q => (
                            <option key={q.id || (q as any)._id} value={q.id || (q as any)._id}>
                              {q.documentNumber || (q as any).quoteNumber} - {q.clientInfo.name} ({formatCurrency(q.totalAmount, q.currency)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {docType === 'FINAL_INVOICE' && (
                      <>
                        <div className="form-group">
                          <label>Import details from Quotation</label>
                          <select
                            className="form-select"
                            value={quotationRef}
                            onChange={(e) => handleImportQuotation(e.target.value)}
                          >
                            <option value="">-- Select Quotation to Import --</option>
                            {quotations.map(q => (
                              <option key={q.id || (q as any)._id} value={q.id || (q as any)._id}>
                                {q.documentNumber || (q as any).quoteNumber} - {q.clientInfo.name} ({formatCurrency(q.totalAmount, q.currency)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Import details from Proforma</label>
                          <select
                            className="form-select"
                            value={proformaRef}
                            onChange={(e) => handleImportProforma(e.target.value)}
                          >
                            <option value="">-- Select Proforma to Import --</option>
                            {proformas.map(p => (
                              <option key={p.id || (p as any)._id} value={p.id || (p as any)._id}>
                                {p.documentNumber || (p as any).proformaNumber} - {p.clientInfo.name} ({formatCurrency(p.totalAmount, p.currency)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Client selection row */}
                <div className="form-group">
                  <label>Client</label>
                  {!isCreatingClient ? (
                    <div className="client-selection-row">
                      <select
                        className="form-select"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        required
                      >
                        <option value="">-- Select Client --</option>
                        {clients.map((c) => (
                          <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                      <button className="btn-inline-action" onClick={(e) => { e.preventDefault(); setIsCreatingClient(true); }}>
                        + New Client
                      </button>
                    </div>
                  ) : (
                    <div className="inline-client-card">
                      <h4>Register New Client inline</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Client Name *"
                            className="form-input"
                            value={newClientData.name}
                            onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="email"
                            placeholder="Client Email *"
                            className="form-input"
                            value={newClientData.email}
                            onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-row" style={{ marginTop: '0.5rem' }}>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Tax ID / Registration Code *"
                            className="form-input"
                            value={newClientData.taxId}
                            onChange={(e) => setNewClientData({ ...newClientData, taxId: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Billing Address"
                            className="form-input"
                            value={newClientData.billingAddress}
                            onChange={(e) => setNewClientData({ ...newClientData, billingAddress: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-row" style={{ marginTop: '0.5rem' }}>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="GSTIN"
                            className="form-input"
                            value={newClientData.gstin}
                            onChange={(e) => setNewClientData({ ...newClientData, gstin: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="PAN"
                            className="form-input"
                            value={newClientData.pan}
                            onChange={(e) => setNewClientData({ ...newClientData, pan: e.target.value })}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                        <button className="btn-secondary-action" style={{ padding: '0.4rem 1rem' }} onClick={(e) => { e.preventDefault(); setIsCreatingClient(false); }}>
                          Cancel
                        </button>
                        <button className="btn-primary-action" style={{ padding: '0.4rem 1.25rem' }} onClick={handleCreateClient}>
                          Save Client
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Doc Details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Document Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{docType === 'FINAL_INVOICE' ? 'Due Date' : 'Valid Until'}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateVal}
                      onChange={(e) => setDateVal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      className="form-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Thank you for your business"
                      className="form-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>


                {/* Items Section */}
                <div className="items-section-title">Line Items</div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', marginBottom: '1.25rem' }}>
                  <table className="items-table" style={{ minWidth: '700px', margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '32%' }}>Description *</th>
                        <th style={{ width: '13%' }}>HSN/SAC</th>
                        <th style={{ width: '10%' }}>Qty</th>
                        <th style={{ width: '12%' }}>Price *</th>
                        <th style={{ width: '10%' }}>Disc (%)</th>
                        <th style={{ width: '10%' }}>Tax (%)</th>
                        <th style={{ width: '10%', textAlign: 'right' }}>Total</th>
                        <th style={{ width: '3%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const baseVal = getItemQty(item.quantity) * item.price;
                        const discAmt = baseVal * ((Number(item.discountPercent) || 0) / 100);
                        const itemSubTotal = baseVal - discAmt;
                        const itemTax = itemSubTotal * (item.taxRate / 100);
                        const itemTotal = itemSubTotal + itemTax;
                        return (
                          <tr key={idx} className="item-row">
                            <td>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                placeholder="Service / Product name"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.hsnSac}
                                onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                                placeholder="998311"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.quantity === undefined || item.quantity === null ? '' : item.quantity}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d*$/.test(val)) {
                                    let cleaned = val;
                                    if (/^0\d+/.test(val)) {
                                      cleaned = val.replace(/^0+/, '');
                                    }
                                    handleItemChange(idx, 'quantity', cleaned === '' ? undefined : Number(cleaned));
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.price === 0 ? '' : item.price}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    let cleaned = val;
                                    if (/^0\d+/.test(val) && !val.startsWith('0.')) {
                                      cleaned = val.replace(/^0+/, '');
                                    }
                                    handleItemChange(idx, 'price', cleaned === '' ? 0 : Number(cleaned));
                                  }
                                }}
                                placeholder="0.00"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.discountPercent === 0 ? '' : item.discountPercent}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    let cleaned = val;
                                    if (/^0\d+/.test(val) && !val.startsWith('0.')) {
                                      cleaned = val.replace(/^0+/, '');
                                    }
                                    handleItemChange(idx, 'discountPercent', cleaned === '' ? 0 : Number(cleaned));
                                  }
                                }}
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.taxRate === 0 ? '' : item.taxRate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d*$/.test(val)) {
                                    let cleaned = val;
                                    if (/^0\d+/.test(val)) {
                                      cleaned = val.replace(/^0+/, '');
                                    }
                                    handleItemChange(idx, 'taxRate', cleaned === '' ? 0 : Number(cleaned));
                                  }
                                }}
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '500' }}>
                              {formatCurrency(itemTotal, currency)}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-delete-item"
                                disabled={items.length === 1}
                                onClick={() => handleRemoveItem(idx)}
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="btn-inline-action" onClick={handleAddItem}>
                  + Add Item
                </button>

                {/* Totals Summary */}
                <div className="totals-summary">
                  <div>Subtotal: {formatCurrency(formSubTotal, currency)}</div>
                  <div>Tax Amount: {formatCurrency(formTaxAmount, currency)}</div>
                  <div className="grand-total">Total: {formatCurrency(formTotalAmount, currency)}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary-action" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={createQuotation.isPending || createProforma.isPending || createInvoice.isPending || updateQuotation.isPending || updateProforma.isPending || updateInvoice.isPending}
                >
                  {createQuotation.isPending || createProforma.isPending || createInvoice.isPending || updateQuotation.isPending || updateProforma.isPending || updateInvoice.isPending ? 'Saving...' : editingDoc ? 'Save Changes' : 'Create Document'}
                </button>
              </div>
          </form>
        </div>
      )}

      {/* EXCEL SPREADSHEET PREVIEW MODAL */}
      {isExcelPreviewOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-card" style={{ width: '90%', maxWidth: '1200px', height: '80vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: 0 }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Excel Spreadsheet Live Preview
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={handleExportToExcel}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  📥 Export .xlsx
                </button>
                <button type="button" className="btn-close" style={{ color: '#94a3b8' }} onClick={() => setIsExcelPreviewOpen(false)}>&times;</button>
              </div>
            </div>

            {/* Tab Selection */}
            <div style={{ display: 'flex', backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {(['Quotations', 'Proformas', 'Final Invoices'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setExcelPreviewTab(tab)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: excelPreviewTab === tab ? '#0f172a' : 'transparent',
                    color: excelPreviewTab === tab ? '#3b82f6' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderTop: excelPreviewTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  📁 {tab}
                </button>
              ))}
            </div>

            {/* Modal Body / Spreadsheet View */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                fontFamily: '"Segoe UI", sans-serif',
                overflow: 'hidden',
                width: 'fit-content',
                minWidth: '100%'
              }}>
                {/* Excel Coordinates Header (A, B, C...) */}
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <div style={{ width: '40px', borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}></div>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{ width: i === 0 ? '140px' : i === 1 || i === 2 ? '180px' : i === 3 || i === 4 ? '90px' : i === 5 || i === 6 || i === 7 ? '110px' : '100px', borderRight: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>

                {/* Row 1: Merged Title */}
                <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1' }}>
                  <div style={{ width: '40px', backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>1</div>
                  <div style={{ flex: 1, padding: '0.75rem', fontSize: '1.15rem', fontWeight: 700, color: '#4f46e5', textAlign: 'left' }}>
                    {excelPreviewTab === 'Quotations' ? 'Quotations Billing Archive Report' : excelPreviewTab === 'Proformas' ? 'Proforma Invoices Billing Archive Report' : 'Final Invoices Billing Archive Report'}
                  </div>
                </div>

                {/* Row 2: Spacer */}
                <div style={{ display: 'flex', height: '15px', borderBottom: '1px solid #cbd5e1' }}>
                  <div style={{ width: '40px', backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>2</div>
                  <div style={{ flex: 1, backgroundColor: '#fff' }}></div>
                </div>

                {/* Row 3: Indigo Table Header */}
                <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1' }}>
                  <div style={{ width: '40px', backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>3</div>
                  {(excelPreviewTab === 'Quotations' 
                    ? ['Quote Number', 'Client Name', 'Client Email', 'Date', 'Valid Until', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status']
                    : excelPreviewTab === 'Proformas'
                    ? ['Proforma Number', 'Client Name', 'Client Email', 'Date', 'Due Date', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status']
                    : ['Invoice Number', 'Client Name', 'Client Email', 'Date', 'Due Date', 'Subtotal (INR)', 'Tax Amount (INR)', 'Total Amount (INR)', 'Status']
                  ).map((h, i) => (
                    <div key={i} style={{
                      width: i === 0 ? '140px' : i === 1 || i === 2 ? '180px' : i === 3 || i === 4 ? '90px' : i === 5 || i === 6 || i === 7 ? '110px' : '100px',
                      borderRight: '1px solid #312e81',
                      backgroundColor: '#4f46e5',
                      color: '#fff',
                      padding: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Row 4+: Data Rows */}
                {(() => {
                  const data = excelPreviewTab === 'Quotations' 
                    ? filteredQuotes.map((q: any) => [q.quoteNumber || q.documentNumber || '', q.clientInfo?.name || '', q.clientInfo?.email || '', q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '', q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '', q.subtotal || 0, q.taxAmount || 0, q.totalAmount || 0, q.status || ''])
                    : excelPreviewTab === 'Proformas'
                    ? filteredProformas.map((p: any) => [p.proformaNumber || p.documentNumber || '', p.clientInfo?.name || '', p.clientInfo?.email || '', p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '', p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '', p.subtotal || 0, p.taxAmount || 0, p.totalAmount || 0, p.status || ''])
                    : filteredInvoices.map((i: any) => [i.invoiceNumber || i.documentNumber || '', i.clientInfo?.name || '', i.clientInfo?.email || '', i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '', i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '', i.subtotal || 0, i.taxAmount || 0, i.totalAmount || 0, i.status || '']);

                  if (data.length === 0) {
                    return (
                      <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1' }}>
                        <div style={{ width: '40px', backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>4</div>
                        <div style={{ flex: 1, padding: '12px', fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic', textAlign: 'center' }}>No records found</div>
                      </div>
                    );
                  }

                  return data.map((rowVal: any[], rowIndex: number) => (
                    <div key={rowIndex} style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <div style={{ width: '40px', backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{rowIndex + 4}</div>
                      {rowVal.map((val: any, cellIdx: number) => {
                        const isNum = typeof val === 'number';
                        return (
                          <div key={cellIdx} style={{
                            width: cellIdx === 0 ? '140px' : cellIdx === 1 || cellIdx === 2 ? '180px' : cellIdx === 3 || cellIdx === 4 ? '90px' : cellIdx === 5 || cellIdx === 6 || cellIdx === 7 ? '110px' : '100px',
                            borderRight: '1px solid #cbd5e1',
                            padding: '6px 8px',
                            fontSize: '0.8rem',
                            color: '#334155',
                            textAlign: isNum ? 'right' : 'left',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {isNum ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : val}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Preview matches exact columns, formatting, and row styles exported to .xlsx workbook sheets.
              </span>
              <button type="button" className="btn-secondary-action" onClick={() => setIsExcelPreviewOpen(false)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING PRINT PREVIEW MODAL */}
      {printDoc && (
        <div className="modal-overlay print-overlay">
          <div className="modal-card print-preview-card">
            <div className="modal-header no-print">
              <h3>Print Preview</h3>
              <button type="button" className="btn-close" onClick={() => setPrintDoc(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ background: '#f8f9fa', padding: 0 }}>
              {renderAuditTrail(printDoc)}
              <iframe
                ref={iframeRef}
                title="Print Preview"
                style={{ width: '100%', height: '700px', border: 'none', background: '#fff', display: 'block' }}
                srcDoc={generateDocumentHtml(getDocumentData(printDoc))}
              />
              <div className="print-area" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: generateDocumentHtml(getDocumentData(printDoc)) }} />
            </div>
            <div className="modal-footer no-print">
              <button type="button" className="btn-secondary-action" onClick={() => setPrintDoc(null)}>Close</button>
              {printDoc.documentType === 'QUOTATION' && printDoc.status !== 'CONVERTED' && (
                <>
                  <button type="button" className="btn-primary-action" style={{ background: '#eab308', borderColor: '#eab308' }} onClick={() => handleConvertQuote(printDoc.id || (printDoc as any)._id)}>
                    Convert to Proforma
                  </button>
                  <button type="button" className="btn-primary-action" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => handleConvertQuoteToInvoiceDirect(printDoc.id || (printDoc as any)._id)}>
                    Convert to Final Invoice
                  </button>
                </>
              )}
              {printDoc.documentType === 'PROFORMA' && printDoc.status !== 'CONVERTED' && (
                <button type="button" className="btn-primary-action" style={{ background: '#f97316', borderColor: '#f97316' }} onClick={() => handleConvertProforma(printDoc.id || (printDoc as any)._id)}>
                  Convert to Final Invoice
                </button>
              )}
              <button type="button" className="btn-primary-action" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#059669' }} onClick={() => handleDownloadHtml(printDoc)}>Download HTML</button>
              <button type="button" className="btn-primary-action" onClick={handlePrint}>Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '750px', padding: '1.75rem', overflowY: 'auto' }}>
            <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                ⚙️ Workspace Profile Settings
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Update branding, tax details, bank account, and UI styling for your workspace.
              </p>
            </div>

            <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '1.25rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Company Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Company Name *</label>
                    <input 
                      type="text" 
                      required
                      value={settingsData.companyName}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, companyName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Proprietor / Owner Name</label>
                    <input 
                      type="text"
                      value={settingsData.proprietorName}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, proprietorName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Official Billing Address *</label>
                    <textarea 
                      required
                      value={settingsData.address}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, address: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', height: '70px', resize: 'none' }}
                      placeholder="e.g. 2b/706, 7th Floor..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Company Logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleWorkspaceLogoUpload}
                      style={{ width: '100%', padding: '0.35rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                    {settingsData.logoUrl && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={settingsData.logoUrl} alt="Preview" style={{ height: '24px', width: '24px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Logo Uploaded</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Digital Signature (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleWorkspaceSignatureUpload}
                      style={{ width: '100%', padding: '0.35rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                    {settingsData.signatureUrl && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={settingsData.signatureUrl} alt="Preview" style={{ height: '24px', width: '24px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Signature Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '1.25rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Tax Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>GSTIN / Tax ID</label>
                    <input 
                      type="text" 
                      value={settingsData.gstin}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. 27ALQPB3481K1ZR"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>PAN Number</label>
                    <input 
                      type="text" 
                      value={settingsData.pan}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. ALQPB3481K"
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '1.25rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Bank Account Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Holder Name</label>
                    <input 
                      type="text"
                      value={settingsData.bankAccHolder}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankAccHolder: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. Acme Corp Invoices"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Bank Name</label>
                    <input 
                      type="text"
                      value={settingsData.bankName}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. YES BANK"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Number</label>
                    <input 
                      type="text"
                      value={settingsData.bankAccNumber}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankAccNumber: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. 021261900003481"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>IFSC Code</label>
                    <input 
                      type="text"
                      value={settingsData.bankIfsc}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. YESB0000212"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Branch Name</label>
                    <input 
                      type="text"
                      value={settingsData.bankBranch}
                      onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankBranch: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      placeholder="e.g. Kandivali East"
                    />
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    4. Workspace Styling & Subscription Tier
                  </h4>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#1e293b', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #334155' }}>
                    🔒 Managed by Administrator only
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Workspace Theme</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {[
                        { id: 'DEFAULT', name: 'Classic Orange', color: '#fb923c' },
                        { id: 'EMERALD', name: 'Emerald Green', color: '#10b981' },
                        { id: 'SAPPHIRE', name: 'Sapphire Blue', color: '#3b82f6' },
                        { id: 'ROYAL', name: 'Royal Gold', color: '#fbbf24' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          disabled
                          style={{
                            flex: 1,
                            backgroundColor: settingsData.theme === t.id ? '#1e293b' : '#0f172a',
                            border: `2px solid ${settingsData.theme === t.id ? t.color : '#334155'}`,
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'not-allowed',
                            opacity: settingsData.theme === t.id ? 1 : 0.4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.color }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Workspace Subscription Tier</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                      {[
                        { id: 'FREE', name: 'Free Tier', badge: 'Standard Features' },
                        { id: 'PREMIUM', name: 'Premium Tier 👑', badge: 'Advanced Layouts' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          disabled
                          style={{
                            flex: 1,
                            backgroundColor: settingsData.tier === p.id ? '#1e293b' : '#0f172a',
                            border: `2px solid ${settingsData.tier === p.id ? '#818cf8' : '#334155'}`,
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'not-allowed',
                            opacity: settingsData.tier === p.id ? 1 : 0.4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontWeight: settingsData.tier === p.id ? 'bold' : 'normal' }}>{p.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{p.badge}</span>
                        </button>
                      ))}
                    </div>

                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.45rem' }}>Active Subscription Details</label>
                    <div style={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Plan</span>
                        <strong style={{ color: '#fff' }}>
                          {getPlanLabel(tenantProfile?.subscriptionPlan || 'FREE')}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Amount</span>
                        <strong style={{ color: '#fff' }}>
                          {getPlanPrice(tenantProfile?.subscriptionPlan || 'FREE')}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Start/Sync Date</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 500 }}>
                          {formatDateTime(tenantProfile?.updatedAt)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Expires On</span>
                        <span style={{ 
                          color: tenantProfile?.subscriptionStatus === 'EXPIRED' ? '#f87171' : '#34d399', 
                          fontWeight: 700 
                        }}>
                          {tenantProfile?.subscriptionPlan === 'LIFETIME' ? 'Never (Lifetime)' : (tenantProfile?.subscriptionPlan === 'FREE' ? 'N/A' : formatDateTime(tenantProfile?.subscriptionExpiresAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsSettingsOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    color: '#94a3b8',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    backgroundColor: 'var(--primary)',
                    border: 'none',
                    color: '#000',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px var(--primary-glow)'
                  }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Renewal Modal */}
      {isRenewalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            boxSizing: 'border-box',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                ⚡ Renew Subscription
              </h2>
              <button 
                type="button" 
                onClick={() => setIsRenewalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.35rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>Renewal Plan</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{getPlanLabel(tenantProfile?.subscriptionPlan || '1_MONTH')}</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>₹{getPlanPriceNum(tenantProfile?.subscriptionPlan || '1_MONTH').toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRenewalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                  Scan the QR code below via GPay/PhonePe to make your payment, then enter the 12-digit UTR verification code.
                </p>

                {/* Dynamic UPI QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
                  <div style={{ backgroundColor: '#fff', padding: '0.85rem', borderRadius: '10px' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=5&data=${encodeURIComponent(getRenewalUpiUrl())}`} 
                      alt="UPI QR Code" 
                      style={{ display: 'block', width: '180px', height: '180px' }} 
                    />
                  </div>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', textAlign: 'left' }}>
                  <div><span style={{ color: '#64748b' }}>Payee Name:</span> <strong style={{ color: '#fff' }}>ROHIT BARGE</strong></div>
                  <div><span style={{ color: '#64748b' }}>VPA:</span> <strong style={{ color: '#fff', fontFamily: 'monospace' }}>rohitbarge22-3@okaxis</strong></div>
                  <div><span style={{ color: '#64748b' }}>Transaction Note:</span> <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{getRenewalUpiNote()}</strong></div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Enter 12-digit UPI Ref / UTR Number *</label>
                <input 
                  type="text" 
                  required
                  pattern="\d{12}"
                  maxLength={12}
                  placeholder="e.g. 123456789012"
                  value={renewalUtr}
                  onChange={(e) => setRenewalUtr(e.target.value.replace(/\D/g, '').substring(0, 12))}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {renewalStatus && (
                <div style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#e2e8f0',
                  lineHeight: 1.4
                }}>
                  {renewalStatus}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsRenewalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    color: '#94a3b8',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={renewalLoading}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: renewalLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {renewalLoading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
