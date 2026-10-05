import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/formatters';
import { checkApiHealth, fetchQuotations, fetchProformas, fetchFinalInvoices, DocumentData } from '../api/client';
import { FileText, FileSpreadsheet, Receipt, Plus, Wifi, WifiOff, Users, ArrowUpRight } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [quotations, setQuotations] = useState<DocumentData[]>([]);
  const [proformas, setProformas] = useState<DocumentData[]>([]);
  const [invoices, setInvoices] = useState<DocumentData[]>([]);

  const loadData = async () => {
    setLoading(true);
    const health = await checkApiHealth();
    setIsConnected(health);

    if (health) {
      try {
        const [qData, pData, iData] = await Promise.all([
          fetchQuotations().catch(() => []),
          fetchProformas().catch(() => []),
          fetchFinalInvoices().catch(() => []),
        ]);
        setQuotations(qData);
        setProformas(pData);
        setInvoices(iData);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      }
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalQuotations = quotations.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  const totalProformas = proformas.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  const totalInvoices = invoices.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  const paidInvoices = invoices.filter(i => i.isPaid).reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>PROCash ERP</Text>
            <Text style={styles.appSubtitle}>Invoice & Billing Dashboard</Text>
          </View>

          {/* Connection Indicator */}
          <View style={[styles.statusBadge, { backgroundColor: isConnected ? '#DCFCE7' : '#FEE2E2' }]}>
            {isConnected ? <Wifi size={14} color="#16A34A" /> : <WifiOff size={14} color="#DC2626" />}
            <Text style={[styles.statusText, { color: isConnected ? '#15803D' : '#B91C1C' }]}>
              {isConnected ? 'API Live' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Create</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.quotation.main }]}
            onPress={() => navigation.navigate('DocumentEditor', { type: 'QUOTATION' })}
          >
            <Plus size={16} color={colors.quotation.main} />
            <Text style={[styles.actionBtnText, { color: colors.quotation.main }]}>Quotation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.proforma.main }]}
            onPress={() => navigation.navigate('DocumentEditor', { type: 'PROFORMA' })}
          >
            <Plus size={16} color={colors.proforma.main} />
            <Text style={[styles.actionBtnText, { color: colors.proforma.main }]}>Proforma</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.finalInvoice.main }]}
            onPress={() => navigation.navigate('DocumentEditor', { type: 'FINAL_INVOICE' })}
          >
            <Plus size={16} color={colors.finalInvoice.main} />
            <Text style={[styles.actionBtnText, { color: colors.finalInvoice.main }]}>Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Overview Metrics */}
        <Text style={styles.sectionTitle}>Financial Summary</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.metricsContainer}>
            {/* Card 1: Quotations */}
            <View style={[styles.metricCard, { borderLeftColor: colors.quotation.main }]}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.quotation.light }]}>
                  <FileText size={20} color={colors.quotation.main} />
                </View>
                <Text style={styles.metricCount}>{quotations.length} Docs</Text>
              </View>
              <Text style={styles.metricLabel}>Quotations Volume</Text>
              <Text style={[styles.metricValue, { color: colors.quotation.main }]}>
                {formatINR(totalQuotations)}
              </Text>
            </View>

            {/* Card 2: Proforma Invoices */}
            <View style={[styles.metricCard, { borderLeftColor: colors.proforma.main }]}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.proforma.light }]}>
                  <FileSpreadsheet size={20} color={colors.proforma.main} />
                </View>
                <Text style={styles.metricCount}>{proformas.length} Docs</Text>
              </View>
              <Text style={styles.metricLabel}>Pending Proformas</Text>
              <Text style={[styles.metricValue, { color: colors.proforma.main }]}>
                {formatINR(totalProformas)}
              </Text>
            </View>

            {/* Card 3: Final Invoices */}
            <View style={[styles.metricCard, { borderLeftColor: colors.finalInvoice.main }]}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.finalInvoice.light }]}>
                  <Receipt size={20} color={colors.finalInvoice.main} />
                </View>
                <Text style={styles.metricCount}>{invoices.length} Docs</Text>
              </View>
              <Text style={styles.metricLabel}>Confirmed Billed Revenue</Text>
              <Text style={[styles.metricValue, { color: colors.finalInvoice.main }]}>
                {formatINR(totalInvoices)}
              </Text>
              <View style={styles.paidRow}>
                <Text style={styles.paidText}>Collected: {formatINR(paidInvoices)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Nav Shortcut */}
        <TouchableOpacity
          style={styles.clientDirectoryCard}
          onPress={() => navigation.navigate('Clients')}
        >
          <View style={styles.clientCardLeft}>
            <View style={styles.clientIconBox}>
              <Users size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.clientCardTitle}>Client Directory & Ledger</Text>
              <Text style={styles.clientCardSub}>View registered clients & pending balances</Text>
            </View>
          </View>
          <ArrowUpRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    padding: 10,
    borderRadius: 10,
  },
  metricCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  paidRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  clientDirectoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  clientCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientIconBox: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  clientCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientCardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
