import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useGitHubRepos = () => {
  return useQuery({
    queryKey: ['github', 'repos'],
    queryFn: async () => {
      const { data } = await api.get('/github/repos');
      return data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRepoStats = (owner, repo) => {
  return useQuery({
    queryKey: ['github', 'stats', owner, repo],
    queryFn: async () => {
      const { data } = await api.get(`/github/repos/${owner}/${repo}/stats`);
      return data;
    },
    enabled: !!owner && !!repo,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRepoContributors = (owner, repo) => {
  return useQuery({
    queryKey: ['github', 'contributors', owner, repo],
    queryFn: async () => {
      const { data } = await api.get(`/github/repos/${owner}/${repo}/contributors`);
      return data;
    },
    enabled: !!owner && !!repo,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
