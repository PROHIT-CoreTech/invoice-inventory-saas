import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client.js';
import { Quotation } from '@my-billing/database';

export const useGetQuotations = () => {
  return useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: async () => {
      const response = await apiClient.get('/quotations');
      return response.data;
    },
  });
};

export const useGetQuotation = (id: string) => {
  return useQuery<Quotation>({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const response = await apiClient.get(`/quotations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<Quotation, Error, Omit<Quotation, 'id' | 'subTotal' | 'taxAmount' | 'totalAmount'>>({
    mutationFn: async (newQuote) => {
      const response = await apiClient.post('/quotations', newQuote);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<Quotation, Error, { id: string; data: Partial<Quotation> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/quotations/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
    },
  });
};

export const useConvertQuoteToProforma = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (quoteId) => {
      const response = await apiClient.post(`/convert/quote-to-proforma/${quoteId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['proformaInvoices'] });
    },
  });
};

export const useConvertQuoteToInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (quoteId) => {
      const response = await apiClient.post(`/convert/quote-to-invoice/${quoteId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['finalInvoices'] });
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/quotations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};
