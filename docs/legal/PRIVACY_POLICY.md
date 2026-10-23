# Privacy Policy

**Product:** PROCash Invoices ERP  
**Entity:** PROHIT CORETECH  
**Website:** [https://prohitcoretech.com](https://prohitcoretech.com)  
**Effective Date:** October 23, 2026  
**Last Updated:** October 23, 2026  

---

## 1. Introduction & Overview

At **PROCash Invoices** (operated by **PROHIT CORETECH**, "we", "us", or "our"), we place the highest priority on the privacy and confidentiality of your commercial and business data. 

This Privacy Policy explains how we collect, process, store, and protect your information when you access our multi-tenant invoicing website, onboard your business workspace, use the Android companion app, or interact with our APIs.

We adhere strictly to the **Information Technology Act, 2000**, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and relevant international data protection standards (including GDPR core principles where applicable).

---

## 2. Information We Collect

### 2.1 Merchant Profile Data
During tenant account creation and workspace onboarding, we collect:
- Business Legal Name and Trade Name.
- Authorized Representative Name and Email Address.
- Business Contact Number (used for OTP verification, WhatsApp invoices, and customer care).
- Registered Physical Business Address, State, and PIN Code.
- Goods and Services Tax Identification Number (**GSTIN**) and Permanent Account Number (**PAN**).

### 2.2 Bank & Remittance Details (For Invoice Printing)
To enable automated rendering of your payment instructions on outbound PDF invoices, you may optionally input:
- Bank Account Name and Bank Name.
- Account Number and Account Type.
- Bank Branch and IFSC Code.
- UPI VPA ID / QR code linkage.

> *Note: These banking credentials are stored strictly for the purpose of printing remittance details on your customer invoices. We NEVER request or store your Net Banking login passwords, debit card PINs, or UPI MPINs.*

### 2.3 Business Transaction & Customer Records
When you generate billing documents, you upload and manage:
- Customer / Buyer names, phone numbers, addresses, and state tax codes.
- Item descriptions, HSN/SAC codes, quantities, unit prices, and tax rates.
- Payment ledger records, outstanding dues, and payment transaction receipts.
- Corporate logos and authorized digital signature images (used for PDF generation).

### 2.4 Technical & Audit Logs
When accessing our cloud services, our systems automatically collect:
- IP addresses, device hardware identifiers, and browser user-agent strings.
- Access timestamps, API latency logs, and error diagnostic traces.

---

## 3. Purpose & Legal Basis of Processing

We process your data strictly for legitimate operational purposes:
1. **Service Provisioning:** To provision your isolated tenant database, manage subdomains, and authenticate authorized users.
2. **Tax & Invoicing Automation:** To calculate CGST/SGST/IGST tax splits, assign consecutive financial invoice numbering, and format PDF bills.
3. **Multi-Device Synchronization:** To keep records synchronized between your web browser and the Android companion app.
4. **Subscription Management:** To process subscription orders, confirm UTR bank transfers, and generate GST tax receipts for your software licenses.
5. **Customer Support & Platform Security:** To diagnose platform issues, prevent fraudulent misuse, and provide customer assistance.

---

## 4. Data Security & Storage Architecture

### 4.1 Strict Multi-Tenant Isolation
Tenant records are partitioned using dedicated workspace isolation middleware. Every database query enforces tenant verification to ensure no cross-tenant data leakage occurs.

### 4.2 Encryption Standards
- **In-Transit:** 100% of network traffic between your device and our servers is encrypted using modern Transport Layer Security (TLS 1.3 / HTTPS).
- **At-Rest:** Stored databases, files, and asset storage buckets are encrypted using industry-standard AES-256 encryption.

### 4.3 Payment Card Protection
All electronic payment transactions are handled through PCI-DSS certified third-party payment gateways (Cashfree, Razorpay, Stripe). We do not store complete credit or debit card numbers on our servers.

---

## 5. Information Sharing & Third-Party Disclosure

We **never** sell, monetize, rent, or trade your company's billing records, customer databases, or invoice items to any advertising or data aggregation firms. 

Data is shared only with certified infrastructure and integration partners strictly necessary to operate the platform:
- **Cloud Infrastructure:** Vercel (web edge hosting) and secure cloud database servers (PostgreSQL / MongoDB Atlas).
- **Payment Gateways:** Cashfree Payments, Razorpay, or UPI routing partners to verify license purchases.
- **Lawful Requests:** We may disclose data if legally required by valid subpoenas, court orders, or statutory law enforcement agencies under applicable Indian law.

---

## 6. Data Ownership & Retention

### 6.1 You Own Your Data
Your business records remain your sole property. You maintain the right to export your entire ledger and invoice history to Excel / CSV format at any time.

### 6.2 Retention Schedule
We retain your workspace records as long as your subscription or free trial account remains open. If an account is closed or terminated:
- Active data will be deleted within 30 days of written request.
- Financial audit logs associated with your subscription transactions with PROHIT CORETECH will be preserved in accordance with statutory Indian taxation retention requirements (minimum 7 years).

---

## 7. Your Legal Rights

Subject to applicable laws, you possess the right to:
- **Access & Review:** Review your personal and business data at any time via your workspace settings.
- **Rectification:** Correct inaccurate or outdated business profile details.
- **Data Export:** Export your financial records in standardized machine-readable formats.
- **Account Deletion:** Request the complete deletion and purging of your tenant account.

---

## 8. Cookies & Local Storage

PROCash Invoices utilizes minimal essential session tokens stored in secure `LocalStorage` and HTTP-only session cookies to:
- Retain authenticated sessions across page reloads.
- Remember workspace layout preferences (such as light theme and collapsed sidebar states).
We do not use intrusive third-party cross-site advertising cookies.

---

## 9. Contact Our Privacy Officer

For any inquiries, requests for data deletion, or grievances regarding our privacy practices, please contact our designated Grievance Officer:

**Grievance Officer:** Legal & Privacy Compliance  
**Company:** PROHIT CORETECH  
**Email:** [info@prohitcoretech.com](mailto:info@prohitcoretech.com)  
**Helpline:** +91 757 839 7539  
**Address:** PROHIT CORETECH, Maharashtra, India  
**Response Window:** Within 48 business hours  
