import { Schema, Document } from 'mongoose';
import { Client } from '../types';
export interface ClientDocument extends Omit<Client, 'id'>, Document {
}
export declare const ClientSchema: Schema<ClientDocument, import("mongoose").Model<ClientDocument, any, any, any, Document<unknown, any, ClientDocument, any, {}> & ClientDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ClientDocument, Document<unknown, {}, import("mongoose").FlatRecord<ClientDocument>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ClientDocument> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const ClientModel: import("mongoose").Model<ClientDocument, {}, {}, {}, Document<unknown, {}, ClientDocument, {}, {}> & ClientDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default ClientModel;
//# sourceMappingURL=Client.d.ts.map