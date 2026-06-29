import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDocumentHtml } from './dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockIntraStateData = {
  documentType: 'TAX_INVOICE',
  documentNumber: 'INV-2026-0042',
  issueDate: new Date('2026-06-29'),
  dueDate: new Date('2026-07-14'),
  clientInfo: {
    name: 'Acme Tech Solutions Private Limited',
    billingAndShippingAddress: 'Unit 402, 4th Floor, Dynasty Business Park,\nAndheri Kurla Road, Andheri East, Mumbai, Maharashtra - 400059',
    gstin: '27AAICA9912C1Z2',
    stateName: 'Maharashtra',
    stateCode: '27',
    email: 'finance@acmetech.com'
  },
  items: [
    {
      description: 'Enterprise Cloud ERP Implementation Services',
      specifications: 'Scope: Modules - CRM, Billing, Procurement, HRMS\nDuration: Phase 1 deployment and configuration',
      hsnSac: '998311',
      quantity: 1,
      price: 350000,
      per: 'Nos',
      discountPercent: 10,
      taxRate: 18
    },
    {
      description: 'Dedicated Cloud Server Subscription',
      specifications: 'Configuration: 8 vCPU, 32GB RAM, 500GB NVMe SSD\nBilling Cycle: Annual Subscription',
      hsnSac: '998313',
      quantity: 12,
      price: 8500,
      per: 'Mths',
      discountPercent: 5,
      taxRate: 18
    }
  ]
};

const mockInterStateData = {
  documentType: 'QUOTATION',
  documentNumber: 'QU-2026-0042',
  issueDate: new Date('2026-06-29'),
  validUntil: new Date('2026-07-14'),
  clientInfo: {
    name: 'Bengaluru Tech Labs',
    billingAndShippingAddress: '12, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka - 560038',
    gstin: '29AAICB9912D1Z0',
    stateName: 'Karnataka',
    stateCode: '29',
    email: 'procurement@bengalurutech.io'
  },
  items: [
    {
      description: 'Management & IT Consulting Services',
      specifications: 'Technical roadmap review and architecture consultation sessions',
      hsnSac: '998311',
      quantity: 10,
      price: 15000,
      per: 'Hrs',
      discountPercent: 0,
      taxRate: 18
    }
  ]
};

const mockProformaData = {
  documentType: 'PROFORMA',
  documentNumber: 'PRO-2026-0042',
  issueDate: new Date('2026-06-29'),
  dueDate: new Date('2026-07-29'),
  clientInfo: {
    name: 'Acme Tech Solutions Private Limited',
    billingAndShippingAddress: 'Unit 402, 4th Floor, Dynasty Business Park,\nAndheri Kurla Road, Andheri East, Mumbai, Maharashtra - 400059',
    gstin: '27AAICA9912C1Z2',
    stateName: 'Maharashtra',
    stateCode: '27'
  },
  items: [
    {
      description: 'Enterprise Cloud ERP Implementation Services',
      specifications: 'Scope: Modules - CRM, Billing, Procurement, HRMS\nDuration: Phase 1 deployment and configuration',
      hsnSac: '998311',
      quantity: 1,
      price: 350000,
      per: 'Nos',
      discountPercent: 10,
      taxRate: 18
    }
  ]
};

// Generate files
const verify = () => {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const taxInvoiceHtml = generateDocumentHtml(mockIntraStateData);
  fs.writeFileSync(path.join(outputDir, 'tax_invoice_sample.html'), taxInvoiceHtml);
  console.log('Generated tax_invoice_sample.html (Intra-state Maharashtra)');

  const quotationHtml = generateDocumentHtml(mockInterStateData);
  fs.writeFileSync(path.join(outputDir, 'quotation_sample.html'), quotationHtml);
  console.log('Generated quotation_sample.html (Inter-state Karnataka)');

  const quotationNoGstHtml = generateDocumentHtml({ ...mockInterStateData, applyGst: false });
  fs.writeFileSync(path.join(outputDir, 'quotation_no_gst_sample.html'), quotationNoGstHtml);
  console.log('Generated quotation_no_gst_sample.html (Inter-state Karnataka, No GST)');

  const proformaHtml = generateDocumentHtml(mockProformaData);
  fs.writeFileSync(path.join(outputDir, 'proforma_sample.html'), proformaHtml);
  console.log('Generated proforma_sample.html');

  const proformaNoGstHtml = generateDocumentHtml({ ...mockProformaData, applyGst: false });
  fs.writeFileSync(path.join(outputDir, 'proforma_no_gst_sample.html'), proformaNoGstHtml);
  console.log('Generated proforma_no_gst_sample.html (No GST)');
};

verify();
