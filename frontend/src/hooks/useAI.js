import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useAnalyzeRepo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ owner, repo }) => {
      const { data } = await api.post('/ai/analyze', { owner, repo });
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the cache to trigger a reload of stats or lists
      queryClient.invalidateQueries({
        queryKey: ['github', 'stats', variables.owner, variables.repo],
      });
      // Also cache the AI report explicitly if needed
      queryClient.setQueryData(
        ['ai', 'report', variables.owner, variables.repo],
        data
      );
    },
  });
};

export const useSummarizeCommits = () => {
  return useMutation({
    mutationFn: async (commits) => {
      const { data } = await api.post('/ai/summarize-commits', { commits });
      return data;
    },
  });
};
