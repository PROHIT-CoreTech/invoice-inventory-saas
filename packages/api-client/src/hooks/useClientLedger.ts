import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client.js';

export interface LedgerSummary {
  totalInvoiced: number;
  totalPaid: number;
  netBalanceDue: number;
  totalAdvance: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT' | 'ADVANCE_PAYMENT' | 'REFUND';
  documentNumber?: string;
  invoiceId?: string;
  paymentMode?: string;
  referenceNo?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  notes?: string | null;
  status?: string | null;
}

export interface ClientLedgerResponse {
  client: any;
  summary: LedgerSummary;
  entries: LedgerEntry[];
}

export interface RecordPaymentPayload {
  clientId: string;
  invoiceId?: string | null;
  amount: number;
  type?: 'PAYMENT_RECEIVED' | 'ADVANCE_PAYMENT' | 'REFUND';
  paymentMode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
  referenceNo?: string | null;
  paymentDate?: string | Date;
  notes?: string | null;
}

export const useGetClientLedger = (clientId?: string) => {
  return useQuery<ClientLedgerResponse>({
    queryKey: ['clientLedger', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');
      const response = await apiClient.get(`/client-ledger/${clientId}`);
      return response.data;
    },
    enabled: Boolean(clientId),
  });
};

export const useRecordClientPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RecordPaymentPayload) => {
      const response = await apiClient.post('/client-ledger/payment', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientLedger', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['finalInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeletePaymentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, clientId }: { paymentId: string; clientId: string }) => {
      const response = await apiClient.delete(`/client-ledger/payment/${paymentId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientLedger', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['finalInvoices'] });
    },
  });
};
