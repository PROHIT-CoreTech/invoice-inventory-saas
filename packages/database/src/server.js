"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceModel = exports.ClientModel = void 0;
__exportStar(require("./index.js"), exports);
var Client_js_1 = require("./models/Client.js");
Object.defineProperty(exports, "ClientModel", { enumerable: true, get: function () { return Client_js_1.ClientModel; } });
var Invoice_js_1 = require("./models/Invoice.js");
Object.defineProperty(exports, "InvoiceModel", { enumerable: true, get: function () { return Invoice_js_1.InvoiceModel; } });
//# sourceMappingURL=server.js.map