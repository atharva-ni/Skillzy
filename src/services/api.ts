export const api = {
  getGitHubProfile: async (): Promise<{ success: boolean; isConnected: boolean; avatarUrl?: string; username?: string; connectedAt?: string; repoUrl?: string }> => ({ success: false, isConnected: false }),
  getGitHubRepos: async (): Promise<{ success: boolean; repos: unknown[] }> => ({ success: false, repos: [] }),
  getGitHubCommitHistory: async (): Promise<{ success: boolean; history: unknown[] }> => ({ success: false, history: [] }),
  getGitHubActivity: async (): Promise<{ success: boolean }> => ({ success: false }),
  getGitHubAuthUrl: async (): Promise<{ success: boolean; url?: string }> => ({ success: false }),
  disconnectGitHub: async (): Promise<{ success: boolean }> => ({ success: false })
};
