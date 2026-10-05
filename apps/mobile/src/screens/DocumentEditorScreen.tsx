import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';
import { formatINR, generateDocumentNumber } from '../utils/formatters';
import {
  fetchClients,
  createClient,
  createQuotation,
  createProforma,
  createFinalInvoice,
  ClientData,
  LineItem,
} from '../api/client';
import { Plus, Trash2, UserPlus, Check, ChevronDown } from 'lucide-react-native';

export const DocumentEditorScreen = ({ navigation, route }: any) => {
  const docType: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE' = route?.params?.type || 'QUOTATION';

  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // New Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientGstin, setNewClientGstin] = useState('');

  // Document Fields
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('Payment due within 15 days of invoice date.');
  const [items, setItems] = useState<LineItem[]>([
    { description: 'Professional Services', quantity: 1, rate: 5000, discountPercent: 0, gstRate: 18, amount: 5000 },
  ]);

  const loadClients = async () => {
    try {
      const data = await fetchClients();
      setClients(data || []);
      if (data && data.length > 0) setSelectedClient(data[0]);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  useEffect(() => {
    loadClients();
    setDocumentNumber(generateDocumentNumber(docType, Math.floor(Math.random() * 20)));
  }, [docType]);

  // Calculate Item Totals
  const calculateItemAmount = (rate: number, qty?: number, discPercent?: number) => {
    const q = qty && qty > 0 ? qty : 1;
    const base = rate * q;
    const discount = (base * (discPercent || 0)) / 100;
    return base - discount;
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    const rate = Number(item.rate) || 0;
    const qty = item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : 1;
    const disc = Number(item.discountPercent) || 0;

    item.amount = calculateItemAmount(rate, qty, disc);
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, rate: 0, discountPercent: 0, gstRate: 18, amount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      Alert.alert('Notice', 'At least one line item is required');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Grand Totals Calculation
  const subtotal = items.reduce((acc, item) => {
    const q = item.quantity && item.quantity > 0 ? item.quantity : 1;
    return acc + (item.rate || 0) * q;
  }, 0);

  const totalDiscount = items.reduce((acc, item) => {
    const q = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const base = (item.rate || 0) * q;
    return acc + (base * (item.discountPercent || 0)) / 100;
  }, 0);

  const taxableAmount = subtotal - totalDiscount;

  const totalGst = items.reduce((acc, item) => {
    const q = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const base = (item.rate || 0) * q;
    const disc = (base * (item.discountPercent || 0)) / 100;
    const itemTaxable = base - disc;
    return acc + (itemTaxable * (item.gstRate || 0)) / 100;
  }, 0);

  const grandTotal = taxableAmount + totalGst;

  const handleSaveNewClient = async () => {
    if (!newClientName.trim()) {
      Alert.alert('Error', 'Client name is required');
      return;
    }
    try {
      const created = await createClient({
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone,
        gstin: newClientGstin,
      });
      setClients([...clients, created]);
      setSelectedClient(created);
      setShowNewClientModal(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientGstin('');
      Alert.alert('Success', 'New client saved!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create client');
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Please select or add a client');
      return;
    }

    const payload = {
      documentNumber,
      documentType: docType,
      client: selectedClient._id || selectedClient,
      items,
      subtotal,
      totalDiscount,
      totalGst,
      grandTotal,
      notes,
      date: new Date().toISOString(),
    };

    try {
      if (docType === 'QUOTATION') await createQuotation(payload);
      else if (docType === 'PROFORMA') await createProforma(payload);
      else await createFinalInvoice(payload);

      Alert.alert('Success', `${docType.replace('_', ' ')} saved successfully!`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Documents', { type: docType }),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save document');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>New {docType.replace('_', ' ')}</Text>

        {/* Document Header Fields */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Document Number</Text>
          <TextInput
            style={styles.input}
            value={documentNumber}
            onChangeText={setDocumentNumber}
          />

          <View style={styles.clientSelectHeader}>
            <Text style={styles.fieldLabel}>Select Client</Text>
            <TouchableOpacity
              style={styles.newClientBtn}
              onPress={() => setShowNewClientModal(true)}
            >
              <UserPlus size={14} color={colors.primary} />
              <Text style={styles.newClientBtnText}>+ New Client</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.clientPicker}
            onPress={() => setShowClientModal(true)}
          >
            <Text style={styles.clientPickerText}>
              {selectedClient ? selectedClient.name : 'Select Client...'}
            </Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Line Items Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addItemBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {items.map((item, idx) => (
          <View key={idx} style={styles.itemCard}>
            <View style={styles.itemCardHeader}>
              <Text style={styles.itemIndex}>Item #{idx + 1}</Text>
              <TouchableOpacity onPress={() => removeItem(idx)}>
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Item / Service description"
              placeholderTextColor={colors.textMuted}
              value={item.description}
              onChangeText={val => handleItemChange(idx, 'description', val)}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Rate (₹)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(item.rate || '')}
                  onChangeText={val => handleItemChange(idx, 'rate', val)}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Qty (Optional)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  value={item.quantity !== undefined ? String(item.quantity) : ''}
                  onChangeText={val => handleItemChange(idx, 'quantity', val ? Number(val) : undefined)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Disc (%)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  value={String(item.discountPercent || '')}
                  onChangeText={val => handleItemChange(idx, 'discountPercent', val)}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.fieldLabel}>GST (%)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="18"
                  value={String(item.gstRate || '')}
                  onChangeText={val => handleItemChange(idx, 'gstRate', val)}
                />
              </View>
            </View>

            <View style={styles.itemFooter}>
              <Text style={styles.itemAmountLabel}>Item Total:</Text>
              <Text style={styles.itemAmountValue}>{formatINR(item.amount)}</Text>
            </View>
          </View>
        ))}

        {/* Calculation Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatINR(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              - {formatINR(totalDiscount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total GST:</Text>
            <Text style={styles.summaryValue}>{formatINR(totalGst)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDocument}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save {docType.replace('_', ' ')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Select Client Modal */}
      <Modal visible={showClientModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Client</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {clients.map(c => (
                <TouchableOpacity
                  key={c._id}
                  style={styles.clientItem}
                  onPress={() => {
                    setSelectedClient(c);
                    setShowClientModal(false);
                  }}
                >
                  <Text style={styles.clientItemName}>{c.name}</Text>
                  {c.companyName && <Text style={styles.clientItemSub}>{c.companyName}</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowClientModal(false)}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Inline New Client Modal */}
      <Modal visible={showNewClientModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register New Client</Text>

            <Text style={styles.fieldLabel}>Client / Business Name</Text>
            <TextInput style={styles.input} value={newClientName} onChangeText={setNewClientName} />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput style={styles.input} value={newClientEmail} onChangeText={setNewClientEmail} />

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput style={styles.input} value={newClientPhone} onChangeText={setNewClientPhone} />

            <Text style={styles.fieldLabel}>GSTIN</Text>
            <TextInput style={styles.input} value={newClientGstin} onChangeText={setNewClientGstin} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveClientBtn} onPress={handleSaveNewClient}>
                <Text style={styles.saveClientBtnText}>Save Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowNewClientModal(false)}
              >
                <Text style={styles.closeModalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 60,
  },
  pageTitle: {
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
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
  clientSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  newClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newClientBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  clientPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  clientPickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addItemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemAmountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  itemAmountValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  clientItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientItemSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  closeModalBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modalActions: {
    marginTop: 16,
    gap: 8,
  },
  saveClientBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveClientBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
