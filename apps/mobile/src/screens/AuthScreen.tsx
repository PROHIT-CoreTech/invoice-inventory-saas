import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { sendOtp, verifyOtp } from '../api/client';
import { ShieldCheck, Phone, ArrowRight, CheckCircle } from 'lucide-react-native';

export const AuthScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devHint, setDevHint] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile phone number');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+91${phone.trim()}`;
      const res = await sendOtp(fullPhone);
      setLoading(false);
      setStep('OTP');
      if (res.devOtp) {
        setDevHint(res.devOtp);
      }
      Alert.alert('OTP Sent', `Verification code sent to ${fullPhone}`);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+91${phone.trim()}`;
      const res = await verifyOtp(fullPhone, otp);
      setLoading(false);

      if (res.success) {
        Alert.alert('Welcome!', `Logged in to Workspace: ${res.user?.tenantId}`, [
          {
            text: 'Enter Dashboard',
            onPress: () => navigation.replace('MainTabs'),
          },
        ]);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Verification Failed', err.response?.data?.message || err.message || 'Invalid OTP');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header Branding */}
          <View style={styles.brandBox}>
            <View style={styles.logoIcon}>
              <ShieldCheck size={36} color={colors.primary} />
            </View>
            <Text style={styles.brandTitle}>PROCash ERP</Text>
            <Text style={styles.brandSubtitle}>Secure OTP Mobile Workspace Login</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {step === 'PHONE' ? (
              <>
                <Text style={styles.cardTitle}>Enter Phone Number</Text>
                <Text style={styles.cardSub}>
                  We will send a 6-digit verification code to log into your business workspace.
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98765 43210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.actionBtnText}>Get Verification Code</Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Verify OTP Code</Text>
                <Text style={styles.cardSub}>
                  Enter the 6-digit code sent to <Text style={{ fontWeight: '800' }}>+91 {phone}</Text>
                </Text>

                {devHint && (
                  <View style={styles.devHintBox}>
                    <CheckCircle size={14} color="#16A34A" />
                    <Text style={styles.devHintText}>Dev Mode Test OTP: {devHint}</Text>
                  </View>
                )}

                <TextInput
                  style={styles.otpInput}
                  placeholder="123456"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.success }]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.actionBtnText}>Verify & Enter Workspace</Text>
                      <CheckCircle size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.changePhoneBtn} onPress={() => setStep('PHONE')}>
                  <Text style={styles.changePhoneText}>← Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginBottom: 20,
  },
  countryCode: {
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  otpInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  devHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  devHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  changePhoneBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  changePhoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
