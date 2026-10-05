import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { getApiBaseUrl, setApiBaseUrl } from '../api/config';
import { getCurrentFinancialYear } from '../utils/formatters';
import { Server, Save, Building2, CheckCircle2 } from 'lucide-react-native';

export const SettingsScreen = () => {
  const [hostUrl, setHostUrl] = useState(getApiBaseUrl());
  const [tenantName, setTenantName] = useState('PROCASH INVOICES');
  const [gstin, setGstin] = useState('27AAAAA0000A1Z5');

  const handleSaveHost = () => {
    const updated = setApiBaseUrl(hostUrl);
    setHostUrl(updated);
    Alert.alert('Success', `Backend Host URL updated to:\n${updated}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>App Settings</Text>

        {/* API Host Switcher Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Server size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Backend API Host URL</Text>
          </View>
          <Text style={styles.cardDesc}>
            Set your Express backend server URL (e.g., http://192.168.1.100:5001 or http://10.0.2.2:5001 for Android Emulator).
          </Text>

          <Text style={styles.fieldLabel}>API Base URL</Text>
          <TextInput
            style={styles.input}
            value={hostUrl}
            onChangeText={setHostUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveHost}>
            <Save size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Update API Host</Text>
          </TouchableOpacity>
        </View>

        {/* Business Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building2 size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Business Profile</Text>
          </View>

          <Text style={styles.fieldLabel}>Company Name</Text>
          <TextInput style={styles.input} value={tenantName} onChangeText={setTenantName} />

          <Text style={styles.fieldLabel}>GSTIN</Text>
          <TextInput style={styles.input} value={gstin} onChangeText={setGstin} />

          <View style={styles.fyBox}>
            <CheckCircle2 size={16} color={colors.success} />
            <Text style={styles.fyText}>
              Current Indian Financial Year: <Text style={{ fontWeight: '800' }}>{getCurrentFinancialYear()}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  fyText: {
    fontSize: 13,
    color: '#15803D',
  },
});
