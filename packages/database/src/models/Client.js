"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModel = exports.ClientSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ClientSchema = new mongoose_1.Schema({
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    billingAddress: { type: String, required: true },
    taxId: { type: String, required: true },
    gstin: { type: String },
    pan: { type: String },
}, { timestamps: true });
exports.ClientModel = (0, mongoose_1.model)('Client', exports.ClientSchema);
exports.default = exports.ClientModel;
//# sourceMappingURL=Client.js.map