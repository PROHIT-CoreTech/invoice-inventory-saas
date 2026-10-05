import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/formatters';
import {
  fetchQuotations,
  fetchProformas,
  fetchFinalInvoices,
  convertQuotationToProforma,
  convertProformaToFinal,
  convertQuotationToFinalDirect,
  markInvoicePaid,
  deleteQuotation,
  deleteProforma,
  deleteFinalInvoice,
  DocumentData,
} from '../api/client';
import { Search, Printer, CheckCircle, DollarSign, Trash2, ArrowRight, Plus } from 'lucide-react-native';

export const DocumentsScreen = ({ navigation, route }: any) => {
  const [activeTab, setActiveTab] = useState<'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE'>(
    route?.params?.type || 'QUOTATION'
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      let data: DocumentData[] = [];
      if (activeTab === 'QUOTATION') data = await fetchQuotations();
      else if (activeTab === 'PROFORMA') data = await fetchProformas();
      else if (activeTab === 'FINAL_INVOICE') data = await fetchFinalInvoices();
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleConvertQuotation = (doc: DocumentData) => {
    Alert.alert(
      'Convert Quotation',
      `Choose conversion route for Quotation #${doc.documentNumber}`,
      [
        {
          text: 'Convert to Proforma',
          onPress: async () => {
            try {
              if (doc._id) {
                await convertQuotationToProforma(doc._id);
                Alert.alert('Success', 'Converted to Proforma Invoice!');
                loadDocuments();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Conversion failed');
            }
          },
        },
        {
          text: 'Direct to Final Invoice',
          onPress: async () => {
            try {
              if (doc._id) {
                await convertQuotationToFinalDirect(doc._id);
                Alert.alert('Success', 'Converted directly to Final Invoice!');
                loadDocuments();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Conversion failed');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleConvertProforma = async (doc: DocumentData) => {
    Alert.alert('Convert Proforma', `Convert Proforma #${doc.documentNumber} to Final Invoice?`, [
      {
        text: 'Convert to Final Invoice',
        onPress: async () => {
          try {
            if (doc._id) {
              await convertProformaToFinal(doc._id);
              Alert.alert('Success', 'Proforma converted to Final Invoice!');
              loadDocuments();
            }
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Conversion failed');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleMarkPaid = async (doc: DocumentData) => {
    if (!doc._id) return;
    try {
      await markInvoicePaid(doc._id);
      Alert.alert('Success', 'Invoice marked as PAID!');
      loadDocuments();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark paid');
    }
  };

  const handleDelete = (doc: DocumentData) => {
    Alert.alert('Delete Document', `Are you sure you want to delete ${doc.documentNumber}?`, [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!doc._id) return;
          try {
            if (activeTab === 'QUOTATION') await deleteQuotation(doc._id);
            else if (activeTab === 'PROFORMA') await deleteProforma(doc._id);
            else await deleteFinalInvoice(doc._id);
            loadDocuments();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const filteredDocs = documents.filter(doc => {
    const clientName = typeof doc.client === 'object' ? doc.client.name : '';
    const query = searchQuery.toLowerCase();
    return doc.documentNumber.toLowerCase().includes(query) || clientName.toLowerCase().includes(query);
  });

  const getTabColor = (type: string) => {
    if (type === 'QUOTATION') return colors.quotation.main;
    if (type === 'PROFORMA') return colors.proforma.main;
    return colors.finalInvoice.main;
  };

  const renderDocCard = ({ item }: { item: DocumentData }) => {
    const clientName = typeof item.client === 'object' ? item.client.name : 'Unknown Client';
    const tabColor = getTabColor(activeTab);

    return (
      <View style={[styles.card, { borderLeftColor: tabColor }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.docNumber}>{item.documentNumber}</Text>
            <Text style={styles.clientName}>{clientName}</Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: item.isPaid
                  ? '#DCFCE7'
                  : item.status === 'CONVERTED'
                  ? '#F1F5F9'
                  : '#EFF6FF',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: item.isPaid
                    ? '#16A34A'
                    : item.status === 'CONVERTED'
                    ? '#64748B'
                    : colors.primary,
                },
              ]}
            >
              {item.isPaid ? 'PAID' : item.status || 'ACTIVE'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <Text style={styles.dateText}>
            Date: {item.date ? new Date(item.date).toLocaleDateString() : 'Today'}
          </Text>
          <Text style={[styles.amountText, { color: tabColor }]}>
            {formatINR(item.grandTotal)}
          </Text>
        </View>

        {/* Card Actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('DocumentPreview', { document: item })}
          >
            <Printer size={16} color={colors.textSecondary} />
            <Text style={styles.iconBtnText}>Preview</Text>
          </TouchableOpacity>

          {activeTab === 'QUOTATION' && (
            <TouchableOpacity
              style={[styles.convertBtn, { backgroundColor: colors.quotation.light }]}
              onPress={() => handleConvertQuotation(item)}
            >
              <ArrowRight size={14} color={colors.quotation.main} />
              <Text style={[styles.convertBtnText, { color: colors.quotation.main }]}>Convert</Text>
            </TouchableOpacity>
          )}

          {activeTab === 'PROFORMA' && (
            <TouchableOpacity
              style={[styles.convertBtn, { backgroundColor: colors.proforma.light }]}
              onPress={() => handleConvertProforma(item)}
            >
              <CheckCircle size={14} color={colors.proforma.main} />
              <Text style={[styles.convertBtnText, { color: colors.proforma.main }]}>Convert</Text>
            </TouchableOpacity>
          )}

          {activeTab === 'FINAL_INVOICE' && !item.isPaid && (
            <TouchableOpacity
              style={[styles.convertBtn, { backgroundColor: '#DCFCE7' }]}
              onPress={() => handleMarkPaid(item)}
            >
              <DollarSign size={14} color={colors.success} />
              <Text style={[styles.convertBtnText, { color: colors.success }]}>Mark Paid</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
            <Trash2 size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Segmented Top Tabs */}
        <View style={styles.tabContainer}>
          {(['QUOTATION', 'PROFORMA', 'FINAL_INVOICE'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && {
                  backgroundColor: getTabColor(tab),
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && { color: '#FFFFFF', fontWeight: '800' },
                ]}
              >
                {tab === 'QUOTATION' ? 'Quotations' : tab === 'PROFORMA' ? 'Proformas' : 'Invoices'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Doc # or Client name..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Document List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredDocs}
            keyExtractor={(item, idx) => item._id || String(idx)}
            renderItem={renderDocCard}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} documents found.</Text>
              </View>
            }
          />
        )}

        {/* Floating Create Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: getTabColor(activeTab) }]}
          onPress={() => navigation.navigate('DocumentEditor', { type: activeTab })}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    margin: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  convertBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
