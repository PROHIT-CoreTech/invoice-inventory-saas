import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client.js';
import { Client } from '@my-billing/database';

export const useGetClients = () => {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiClient.get('/clients');
      return response.data;
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/clients', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
