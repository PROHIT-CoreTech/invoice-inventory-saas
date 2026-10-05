import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/formatters';
import { DocumentData } from '../api/client';
import { Share2, Printer, ArrowLeft } from 'lucide-react-native';

export const DocumentPreviewScreen = ({ route, navigation }: any) => {
  const doc: DocumentData = route?.params?.document;

  if (!doc) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No document loaded for preview.</Text>
      </View>
    );
  }

  const clientObj = typeof doc.client === 'object' ? doc.client : { name: 'Client' };

  const handleWhatsAppShare = async () => {
    try {
      const message = `*PROCash Invoice ERP*\n\nDocument #: *${doc.documentNumber}*\nClient: ${clientObj.name}\nGrand Total: *${formatINR(doc.grandTotal)}*\n\nThank you for doing business with PROCASH!`;
      await Share.share({
        message,
        title: `Invoice ${doc.documentNumber}`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Share failed');
    }
  };

  const handlePrint = () => {
    Alert.alert('Android Print', 'Sending document to standard Android System Print spooler...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Back & Share Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color={colors.textPrimary} />
            <Text style={styles.toolbarBtnText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.toolbarRight}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleWhatsAppShare}>
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Printer size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Paper Invoice Preview Card */}
        <View style={styles.paperCard}>
          {/* Header */}
          <View style={styles.paperHeader}>
            <View>
              <Text style={styles.companyName}>PROCASH INVOICES</Text>
              <Text style={styles.companyDetails}>GSTIN: 27AAAAA0000A1Z5</Text>
              <Text style={styles.companyDetails}>Mumbai, MH, India</Text>
            </View>
            <View style={styles.docTypeBadge}>
              <Text style={styles.docTypeBadgeText}>{doc.documentType.replace('_', ' ')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Doc & Client Info */}
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.label}>Billed To:</Text>
              <Text style={styles.valBold}>{clientObj.name}</Text>
              {clientObj.email && <Text style={styles.valSub}>{clientObj.email}</Text>}
              {clientObj.phone && <Text style={styles.valSub}>{clientObj.phone}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Doc Number:</Text>
              <Text style={styles.valBold}>{doc.documentNumber}</Text>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.valSub}>
                {doc.date ? new Date(doc.date).toLocaleDateString() : 'Today'}
              </Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Item</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
          </View>

          {/* Table Rows */}
          {doc.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 2 }]}>{item.description}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>
                {item.quantity !== undefined ? item.quantity : 1}
              </Text>
              <Text style={[styles.td, { flex: 1.5, textAlign: 'right' }]}>
                {formatINR(item.rate)}
              </Text>
              <Text style={[styles.tdBold, { flex: 1.5, textAlign: 'right' }]}>
                {formatINR(item.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Totals Breakdown */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalVal}>{formatINR(doc.subtotal)}</Text>
            </View>
            {doc.totalDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={[styles.totalVal, { color: colors.danger }]}>
                  - {formatINR(doc.totalDiscount)}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST:</Text>
              <Text style={styles.totalVal}>{formatINR(doc.totalGst)}</Text>
            </View>
            <View style={[styles.divider, { marginVertical: 6 }]} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalVal}>{formatINR(doc.grandTotal)}</Text>
            </View>
          </View>

          {/* Terms Footer */}
          {doc.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Terms & Notes:</Text>
              <Text style={styles.notesContent}>{doc.notes}</Text>
            </View>
          )}
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
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toolbarRight: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366', // WhatsApp green
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  printBtn: {
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  companyDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  docTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  docTypeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  valBold: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  valSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  td: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  tdBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  totalVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  notesBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  notesContent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
