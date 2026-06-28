"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSchema = exports.lineItemSchema = exports.clientInfoSchema = exports.clientSchema = void 0;
const zod_1 = require("zod");
exports.clientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Client name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    billingAddress: zod_1.z.string().min(1, 'Billing address is required'),
    taxId: zod_1.z.string().min(1, 'Tax ID is required'),
    gstin: zod_1.z.string().optional(),
    pan: zod_1.z.string().optional(),
});
exports.clientInfoSchema = exports.clientSchema; // Same shape, used for embedded snapshot validation
exports.lineItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, 'Description is required'),
    quantity: zod_1.z.number().positive('Quantity must be greater than 0'),
    price: zod_1.z.number().nonnegative('Price must be greater than or equal to 0'),
    taxRate: zod_1.z.number().nonnegative('Tax rate must be greater than or equal to 0').default(0),
    taxAmount: zod_1.z.number().nonnegative().default(0),
    total: zod_1.z.number().nonnegative().default(0),
});
exports.invoiceSchema = zod_1.z.object({
    documentType: zod_1.z.enum(['QUOTATION', 'PROFORMA', 'FINAL_INVOICE']),
    documentNumber: zod_1.z.string().min(1, 'Document number is required'),
    clientRef: zod_1.z.string().min(1, 'Client ID reference is required'),
    clientInfo: exports.clientInfoSchema,
    items: zod_1.z.array(exports.lineItemSchema).min(1, 'At least one item is required'),
    subTotal: zod_1.z.number().nonnegative().default(0),
    taxAmount: zod_1.z.number().nonnegative().default(0),
    totalAmount: zod_1.z.number().nonnegative().default(0),
    currency: zod_1.z.string().min(1, 'Currency is required').default('INR'),
    notes: zod_1.z.string().optional(),
    issueDate: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).default(() => new Date()),
    dueDate: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).optional(),
    status: zod_1.z.string().default('DRAFT'),
    // Tracing references
    quotationRef: zod_1.z.string().optional(),
    proformaRef: zod_1.z.string().optional(),
    // Optional parameters based on documentType
    validUntil: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).optional(),
    paymentStatus: zod_1.z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID']).optional(),
    paymentDate: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).optional(),
});
//# sourceMappingURL=validation.js.map