import { Schema, Document } from 'mongoose';
import { Invoice, LineItem } from '../types.js';
export declare const LineItemSchema: Schema<LineItem, import("mongoose").Model<LineItem, any, any, any, Document<unknown, any, LineItem, any, {}> & LineItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LineItem, Document<unknown, {}, import("mongoose").FlatRecord<LineItem>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LineItem> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export interface InvoiceDocument extends Omit<Invoice, 'id'>, Document {
}
export declare const InvoiceModel: import("mongoose").Model<InvoiceDocument, {}, {}, {}, Document<unknown, {}, InvoiceDocument, {}, {}> & InvoiceDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default InvoiceModel;
//# sourceMappingURL=Invoice.d.ts.map