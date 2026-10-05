import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// In-memory store for dev OTPs (Use SMS Provider like Twilio / Fast2SMS / MSG91 in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST: Send OTP to Phone Number
router.post('/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone || typeof phone !== 'string') {
    res.status(400).json({ message: 'Phone number is required' });
    return;
  }

  // Clean phone number (strip spaces/dashes)
  const cleanPhone = phone.trim().replace(/[\s-]/g, '');

  // Generate 6-digit OTP (Default fixed '123456' in dev environment for easy testing)
  const otp = process.env.NODE_ENV === 'production' 
    ? Math.floor(100000 + Math.random() * 900000).toString()
    : '123456';

  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  otpStore.set(cleanPhone, { otp, expiresAt });

  console.log(`[AUTH] Sent OTP ${otp} to phone: ${cleanPhone}`);

  res.json({
    success: true,
    message: `OTP sent successfully to ${cleanPhone}`,
    // In dev mode, return OTP for easy testing
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
});

// POST: Verify OTP and Login to Tenant Workspace
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ message: 'Phone number and OTP are required' });
    return;
  }

  const cleanPhone = phone.trim().replace(/[\s-]/g, '');
  const record = otpStore.get(cleanPhone);

  // Validate OTP (Also allow universal dev OTP '123456')
  const isValidDevOtp = otp === '123456';
  const isValidRecord = record && record.otp === otp && Date.now() < record.expiresAt;

  if (!isValidDevOtp && !isValidRecord) {
    res.status(400).json({ message: 'Invalid or expired OTP' });
    return;
  }

  // Clear used OTP
  otpStore.delete(cleanPhone);

  // Generate deterministic unique tenantId based on phone (e.g. tenant-9876543210)
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  const tenantId = `tenant-${digitsOnly || 'default'}`;

  res.json({
    success: true,
    message: 'OTP verified successfully!',
    token: `procash-token-${Date.now()}`,
    user: {
      phone: cleanPhone,
      tenantId,
      companyName: `Business (${cleanPhone.slice(-4)})`,
    },
  });
});

export default router;
