import { z } from 'zod';
export declare const clientSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    billingAddress: z.ZodString;
    taxId: z.ZodString;
    gstin: z.ZodOptional<z.ZodString>;
    pan: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    billingAddress: string;
    taxId: string;
    gstin?: string | undefined;
    pan?: string | undefined;
}, {
    name: string;
    email: string;
    billingAddress: string;
    taxId: string;
    gstin?: string | undefined;
    pan?: string | undefined;
}>;
export declare const clientInfoSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    billingAddress: z.ZodString;
    taxId: z.ZodString;
    gstin: z.ZodOptional<z.ZodString>;
    pan: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    billingAddress: string;
    taxId: string;
    gstin?: string | undefined;
    pan?: string | undefined;
}, {
    name: string;
    email: string;
    billingAddress: string;
    taxId: string;
    gstin?: string | undefined;
    pan?: string | undefined;
}>;
export declare const lineItemSchema: z.ZodObject<{
    description: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    taxRate: z.ZodDefault<z.ZodNumber>;
    taxAmount: z.ZodDefault<z.ZodNumber>;
    total: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    quantity: number;
    price: number;
    taxRate: number;
    taxAmount: number;
    total: number;
}, {
    description: string;
    quantity: number;
    price: number;
    taxRate?: number | undefined;
    taxAmount?: number | undefined;
    total?: number | undefined;
}>;
export declare const invoiceSchema: z.ZodObject<{
    documentType: z.ZodEnum<["QUOTATION", "PROFORMA", "FINAL_INVOICE"]>;
    documentNumber: z.ZodString;
    clientRef: z.ZodString;
    clientInfo: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        billingAddress: z.ZodString;
        taxId: z.ZodString;
        gstin: z.ZodOptional<z.ZodString>;
        pan: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        billingAddress: string;
        taxId: string;
        gstin?: string | undefined;
        pan?: string | undefined;
    }, {
        name: string;
        email: string;
        billingAddress: string;
        taxId: string;
        gstin?: string | undefined;
        pan?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        taxRate: z.ZodDefault<z.ZodNumber>;
        taxAmount: z.ZodDefault<z.ZodNumber>;
        total: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        price: number;
        taxRate: number;
        taxAmount: number;
        total: number;
    }, {
        description: string;
        quantity: number;
        price: number;
        taxRate?: number | undefined;
        taxAmount?: number | undefined;
        total?: number | undefined;
    }>, "many">;
    subTotal: z.ZodDefault<z.ZodNumber>;
    taxAmount: z.ZodDefault<z.ZodNumber>;
    totalAmount: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    issueDate: z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
    dueDate: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
    status: z.ZodDefault<z.ZodString>;
    quotationRef: z.ZodOptional<z.ZodString>;
    proformaRef: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<["UNPAID", "PARTIALLY_PAID", "PAID"]>>;
    paymentDate: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    taxAmount: number;
    documentType: "QUOTATION" | "PROFORMA" | "FINAL_INVOICE";
    documentNumber: string;
    clientRef: string;
    clientInfo: {
        name: string;
        email: string;
        billingAddress: string;
        taxId: string;
        gstin?: string | undefined;
        pan?: string | undefined;
    };
    items: {
        description: string;
        quantity: number;
        price: number;
        taxRate: number;
        taxAmount: number;
        total: number;
    }[];
    subTotal: number;
    totalAmount: number;
    currency: string;
    issueDate: string | Date;
    notes?: string | undefined;
    dueDate?: string | Date | undefined;
    quotationRef?: string | undefined;
    proformaRef?: string | undefined;
    validUntil?: string | Date | undefined;
    paymentStatus?: "PAID" | "UNPAID" | "PARTIALLY_PAID" | undefined;
    paymentDate?: string | Date | undefined;
}, {
    documentType: "QUOTATION" | "PROFORMA" | "FINAL_INVOICE";
    documentNumber: string;
    clientRef: string;
    clientInfo: {
        name: string;
        email: string;
        billingAddress: string;
        taxId: string;
        gstin?: string | undefined;
        pan?: string | undefined;
    };
    items: {
        description: string;
        quantity: number;
        price: number;
        taxRate?: number | undefined;
        taxAmount?: number | undefined;
        total?: number | undefined;
    }[];
    status?: string | undefined;
    taxAmount?: number | undefined;
    subTotal?: number | undefined;
    totalAmount?: number | undefined;
    currency?: string | undefined;
    notes?: string | undefined;
    issueDate?: string | Date | undefined;
    dueDate?: string | Date | undefined;
    quotationRef?: string | undefined;
    proformaRef?: string | undefined;
    validUntil?: string | Date | undefined;
    paymentStatus?: "PAID" | "UNPAID" | "PARTIALLY_PAID" | undefined;
    paymentDate?: string | Date | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map