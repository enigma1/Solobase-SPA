import { useMutation } from '@tanstack/react-query';
import { dbApi } from '>/services/api/dbApi';

export const useRunQuery = () => {
  return useMutation({
    mutationFn: async ({ query, signal }: any) => {
      const data = await dbApi.runQuery({ query }, signal);
      return data;
    },
  });
};
