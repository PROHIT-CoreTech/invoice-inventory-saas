import { Router, Request, Response, NextFunction } from 'express';
import { InvoiceModel, ClientModel } from '@my-billing/database/server';

const router = Router();

// POST: Convert Quotation to Proforma Invoice
router.post('/quote-to-proforma/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quoteId = req.params.id;

    // 1. Fetch the source quotation document
    const quotation = await InvoiceModel.findById(quoteId);
    if (!quotation) {
      res.status(404).json({ message: 'Quotation not found' });
      return;
    }

    // Ensure it is indeed a quotation
    if (quotation.documentType !== 'QUOTATION') {
      res.status(400).json({ message: 'Provided document ID is not a quotation' });
      return;
    }

    // Ensure the quotation has not already been converted
    if (quotation.status === 'CONVERTED') {
      res.status(400).json({ message: 'This quotation has already been converted to a Proforma Invoice' });
      return;
    }

    // 2. Fetch the latest client info from the master database to snapshot
    // If the master profile was deleted, fall back to the snapshot in the quotation
    const client = await ClientModel.findById(quotation.clientRef);
    const clientSnapshot = client 
      ? {
          name: client.name,
          email: client.email,
          billingAddress: client.billingAddress,
          taxId: client.taxId,
          gstin: client.gstin,
          pan: client.pan,
        }
      : quotation.clientInfo;

    // 3. Mark the Quotation status as 'CONVERTED'
    quotation.status = 'CONVERTED';
    await quotation.save();

    // 4. Generate next sequential Proforma document number (e.g. 2026-27/CFS-PRO-001)
    const getFinancialYear = (date: Date = new Date()) => {
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth();
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const endYear = (startYear + 1) % 100;
      return `${startYear}-${String(endYear).padStart(2, '0')}`;
    };
    const fy = getFinancialYear();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startYearNum = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(`${startYearNum}-04-01T00:00:00.000Z`);
    const fyEndDate = new Date(`${startYearNum + 1}-03-31T23:59:59.999Z`);

    const proformaCount = await InvoiceModel.countDocuments({
      documentType: 'PROFORMA',
      createdAt: {
        $gte: fyStartDate,
        $lte: fyEndDate,
      }
    });

    const sequenceNumber = String(proformaCount + 1).padStart(3, '0');
    const proformaNumber = `${fy}/CFS-PRO-${sequenceNumber}`;

    // 5. Build and save the new Proforma Invoice document referencing the Quotation
    const issueDate = new Date();
    
    // Set Proforma due date to 30 days out and valid until 15 days out
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 30);
    const validUntil = new Date();
    validUntil.setDate(issueDate.getDate() + 15);

    const proformaInvoice = new InvoiceModel({
      documentType: 'PROFORMA',
      documentNumber: proformaNumber,
      clientRef: quotation.clientRef,
      clientInfo: clientSnapshot,
      items: quotation.items,
      subTotal: quotation.subTotal,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      currency: quotation.currency,
      notes: quotation.notes,
      issueDate,
      dueDate,
      validUntil,
      status: 'DRAFT',
      quotationRef: quotation._id, // Tracing back to source quotation
    });

    await proformaInvoice.save();

    res.status(201).json({
      message: 'Quotation successfully converted to Proforma Invoice',
      quotation: {
        id: quotation._id,
        status: quotation.status
      },
      proformaInvoice
    });
  } catch (error) {
    next(error);
  }
});

// POST: Convert Quotation directly to Final Invoice (bypassing Proforma)
router.post('/quote-to-invoice/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quoteId = req.params.id;

    // 1. Fetch the source quotation document
    const quotation = await InvoiceModel.findById(quoteId);
    if (!quotation) {
      res.status(404).json({ message: 'Quotation not found' });
      return;
    }

    // Ensure it is indeed a quotation
    if (quotation.documentType !== 'QUOTATION') {
      res.status(400).json({ message: 'Provided document ID is not a quotation' });
      return;
    }

    // Ensure the quotation has not already been converted
    if (quotation.status === 'CONVERTED') {
      res.status(400).json({ message: 'This quotation has already been converted' });
      return;
    }

    // 2. Fetch latest client info or fall back
    const client = await ClientModel.findById(quotation.clientRef);
    const clientSnapshot = client 
      ? {
          name: client.name,
          email: client.email,
          billingAddress: client.billingAddress,
          taxId: client.taxId,
          gstin: client.gstin,
          pan: client.pan,
        }
      : quotation.clientInfo;

    // 3. Mark the Quotation status as 'CONVERTED'
    quotation.status = 'CONVERTED';
    await quotation.save();

    // 4. Generate next sequential Final Invoice document number (e.g. 2026-27/CFS-INV-001)
    const getFinancialYear = (date: Date = new Date()) => {
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth();
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const endYear = (startYear + 1) % 100;
      return `${startYear}-${String(endYear).padStart(2, '0')}`;
    };
    const fy = getFinancialYear();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startYearNum = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(`${startYearNum}-04-01T00:00:00.000Z`);
    const fyEndDate = new Date(`${startYearNum + 1}-03-31T23:59:59.999Z`);

    const invoiceCount = await InvoiceModel.countDocuments({
      documentType: 'FINAL_INVOICE',
      createdAt: {
        $gte: fyStartDate,
        $lte: fyEndDate,
      }
    });

    const sequenceNumber = String(invoiceCount + 1).padStart(3, '0');
    const invoiceNumber = `${fy}/CFS-INV-${sequenceNumber}`;

    // 5. Build and save the new Final Invoice document referencing the Quotation
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 15);

    const finalInvoice = new InvoiceModel({
      documentType: 'FINAL_INVOICE',
      documentNumber: invoiceNumber,
      clientRef: quotation.clientRef,
      clientInfo: clientSnapshot,
      items: quotation.items,
      subTotal: quotation.subTotal,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      currency: quotation.currency,
      notes: quotation.notes,
      issueDate,
      dueDate,
      status: 'DRAFT',
      paymentStatus: 'UNPAID',
      quotationRef: quotation._id, // Tracing directly back to source quotation
    });

    await finalInvoice.save();

    res.status(201).json({
      message: 'Quotation successfully converted directly to Final Invoice',
      quotation: {
        id: quotation._id,
        status: quotation.status
      },
      finalInvoice
    });
  } catch (error) {
    next(error);
  }
});

// POST: Convert Proforma Invoice to Final Invoice
router.post('/proforma-to-invoice/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proformaId = req.params.id;

    // 1. Fetch the source proforma document
    const proforma = await InvoiceModel.findById(proformaId);
    if (!proforma) {
      res.status(404).json({ message: 'Proforma Invoice not found' });
      return;
    }

    // Ensure it is indeed a proforma
    if (proforma.documentType !== 'PROFORMA') {
      res.status(400).json({ message: 'Provided document ID is not a Proforma Invoice' });
      return;
    }

    // Ensure it has not already been converted
    if (proforma.status === 'CONVERTED') {
      res.status(400).json({ message: 'This Proforma Invoice has already been converted to a Final Invoice' });
      return;
    }

    // 2. Fetch the latest client info from the master database to snapshot
    const client = await ClientModel.findById(proforma.clientRef);
    const clientSnapshot = client 
      ? {
          name: client.name,
          email: client.email,
          billingAddress: client.billingAddress,
          taxId: client.taxId,
          gstin: client.gstin,
          pan: client.pan,
        }
      : proforma.clientInfo;

    // 3. Mark the Proforma status as 'CONVERTED'
    proforma.status = 'CONVERTED';
    await proforma.save();

    // 4. Generate next sequential Invoice document number (e.g. 2026-27/CFS-INV-001)
    const getFinancialYear = (date: Date = new Date()) => {
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth();
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const endYear = (startYear + 1) % 100;
      return `${startYear}-${String(endYear).padStart(2, '0')}`;
    };
    const fy = getFinancialYear();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startYearNum = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(`${startYearNum}-04-01T00:00:00.000Z`);
    const fyEndDate = new Date(`${startYearNum + 1}-03-31T23:59:59.999Z`);

    const invoiceCount = await InvoiceModel.countDocuments({
      documentType: 'FINAL_INVOICE',
      createdAt: {
        $gte: fyStartDate,
        $lte: fyEndDate,
      }
    });

    const sequenceNumber = String(invoiceCount + 1).padStart(3, '0');
    const invoiceNumber = `${fy}/CFS-INV-${sequenceNumber}`;

    // 5. Build and save the new Final Invoice document referencing the Proforma
    const issueDate = new Date();
    
    // Set Invoice due date to 15 days out
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 15);

    const finalInvoice = new InvoiceModel({
      documentType: 'FINAL_INVOICE',
      documentNumber: invoiceNumber,
      clientRef: proforma.clientRef,
      clientInfo: clientSnapshot,
      items: proforma.items,
      subTotal: proforma.subTotal,
      taxAmount: proforma.taxAmount,
      totalAmount: proforma.totalAmount,
      currency: proforma.currency,
      notes: proforma.notes,
      issueDate,
      dueDate,
      status: 'DRAFT',
      paymentStatus: 'UNPAID',
      proformaRef: proforma._id, // Tracing back to source proforma
    });

    await finalInvoice.save();

    res.status(201).json({
      message: 'Proforma Invoice successfully converted to Final Invoice',
      proformaInvoice: {
        id: proforma._id,
        status: proforma.status
      },
      finalInvoice
    });
  } catch (error) {
    next(error);
  }
});

export default router;
