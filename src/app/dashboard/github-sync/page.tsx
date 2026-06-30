/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { toast } from 'sonner';
import {
  GitCommit, GitCommitHorizontal, ExternalLink, Link2, Unlink,
  Star, Eye, GitFork, Clock, Code2, FolderGit2, Activity,
  CheckCircle2, AlertCircle, ArrowUpRight, RefreshCw, Calendar
} from 'lucide-react';

export default function GitHubSync() {
  const [profile, setProfile] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(false);
  const [commitsLoading, setCommitsLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getGitHubProfile();
      if (res.success) {
        setProfile(res);
        if (res.isConnected) {
          fetchActivity();
        }
      }
    } catch {
      console.error('GitHub profile fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      setReposLoading(true);
      const res = await api.getGitHubRepos();
      if (res.success) setRepos(res.repos || []);
    } catch {
      toast.error('Failed to fetch repos');
    } finally {
      setReposLoading(false);
    }
  };

  const fetchCommits = async () => {
    try {
      setCommitsLoading(true);
      const res = await api.getGitHubCommitHistory();
      if (res.success) setCommits(res.history || []);
    } catch {
      toast.error('Failed to fetch commits');
    } finally {
      setCommitsLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await api.getGitHubActivity();
      if (res.success) setActivity(res);
    } catch {
      /* silent */
    }
  };

  useEffect(() => { fetchProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    try {
      const res = await api.getGitHubAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch {
      toast.error('Failed to get auth URL');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect GitHub? Your saved code will remain on GitHub.')) return;
    try {
      const res = await api.disconnectGitHub();
      if (res.success) {
        setProfile({ success: true, isConnected: false });
        setRepos([]);
        setCommits([]);
        setActivity(null);
        toast.success('GitHub disconnected');
      }
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const timeAgo = (date: string) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-48 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Not Connected View ──
  if (!profile?.isConnected) {
    return (
      <DashboardLayout>
        <div className="animate-slide-in max-w-2xl mx-auto text-center py-16 space-y-8">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
            <GitCommit size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Connect GitHub</h1>
            <p className="text-[#94A3B8] mt-3 max-w-md mx-auto leading-relaxed">
              Link your GitHub account to automatically sync your code, track contributions, and build your developer portfolio on SkillBridge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: FolderGit2, title: 'Auto Portfolio', desc: 'Code you write is saved to a dedicated GitHub repo' },
              { icon: Activity, title: 'Track Activity', desc: 'Monitor commits, streaks, and contribution stats' },
              { icon: Star, title: 'Showcase Projects', desc: 'Display your repos and contributions on your profile' },
            ].map((f, i) => (
              <div key={i} className="glass-card p-4">
                <f.icon size={20} className="text-[#10B981] mb-2" />
                <h3 className="text-sm text-white font-bold">{f.title}</h3>
                <p className="text-[10px] text-[#64748B] mt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <button onClick={handleConnect}
            className="px-8 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-[#10B981] hover:text-white transition-all inline-flex items-center gap-2 shadow-lg">
            <GitCommit size={18} /> Connect GitHub Account
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Connected View ──
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitCommit size={24} /> GitHub Sync
            </h1>
            <p className="text-[#94A3B8] text-sm mt-1">Your code portfolio and contribution tracker</p>
          </div>
          <button onClick={handleDisconnect}
            className="px-3 py-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs text-[#EF4444] font-bold hover:bg-[#EF4444]/15 transition-all flex items-center gap-1.5">
            <Unlink size={12} /> Disconnect
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <img src={profile.avatarUrl || `https://github.com/${profile.username}.png`}
              alt={profile.username} className="w-20 h-20 rounded-2xl border-2 border-white/10" />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-white">@{profile.username}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 size={10} /> Connected
                </span>
              </div>
              <p className="text-sm text-[#94A3B8] mt-1">Connected {timeAgo(profile.connectedAt)}</p>
              {profile.repoUrl && (
                <a href={profile.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#00D4FF] hover:underline mt-2 inline-flex items-center gap-1">
                  <ExternalLink size={10} /> {profile.repoUrl}
                </a>
              )}
            </div>
            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-3 bg-white/[0.03] rounded-xl border border-white/5">
                <p className="text-xl font-bold text-white">{profile.totalCommits || 0}</p>
                <p className="text-[10px] text-[#94A3B8]">Total Commits</p>
              </div>
              <div className="text-center px-4 py-3 bg-white/[0.03] rounded-xl border border-white/5">
                <p className="text-xl font-bold text-white">{activity?.commitsThisWeek || 0}</p>
                <p className="text-[10px] text-[#94A3B8]">This Week</p>
              </div>
              <div className="text-center px-4 py-3 bg-white/[0.03] rounded-xl border border-white/5">
                <p className="text-xl font-bold text-white">{repos.length || '—'}</p>
                <p className="text-[10px] text-[#94A3B8]">Repos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Repos & Commits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Repositories */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2"><FolderGit2 size={16} className="text-[#F59E0B]" /> Your Repositories</h3>
              <button onClick={fetchRepos} disabled={reposLoading}
                className="text-[10px] text-[#94A3B8] hover:text-white flex items-center gap-1 transition-all">
                <RefreshCw size={12} className={reposLoading ? 'animate-spin' : ''} /> {repos.length > 0 ? 'Refresh' : 'Load Repos'}
              </button>
            </div>
            {repos.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {repos.map((r: any) => (
                  <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer"
                    className="block bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate group-hover:text-[#00D4FF] transition-colors">{r.name}</p>
                        {r.description && <p className="text-[10px] text-[#64748B] mt-0.5 truncate">{r.description}</p>}
                      </div>
                      <ArrowUpRight size={12} className="text-[#64748B] shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {r.language && (
                        <span className="text-[9px] text-[#94A3B8] flex items-center gap-1">
                          <Code2 size={9} /> {r.language}
                        </span>
                      )}
                      <span className="text-[9px] text-[#94A3B8] flex items-center gap-1">
                        <Star size={9} /> {r.stargazers_count}
                      </span>
                      <span className="text-[9px] text-[#94A3B8] flex items-center gap-1">
                        <GitFork size={9} /> {r.forks_count}
                      </span>
                      <span className="text-[9px] text-[#94A3B8] flex items-center gap-1">
                        <Eye size={9} /> {r.watchers_count}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FolderGit2 size={28} className="text-[#64748B] mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">{reposLoading ? 'Loading repositories...' : 'Click "Load Repos" to fetch'}</p>
              </div>
            )}
          </div>

          {/* Commit History */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2"><GitCommit size={16} className="text-[#7C3AED]" /> Recent Commits</h3>
              <button onClick={fetchCommits} disabled={commitsLoading}
                className="text-[10px] text-[#94A3B8] hover:text-white flex items-center gap-1 transition-all">
                <RefreshCw size={12} className={commitsLoading ? 'animate-spin' : ''} /> {commits.length > 0 ? 'Refresh' : 'Load Commits'}
              </button>
            </div>
            {commits.length > 0 ? (
              <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {commits.map((c: any, i: number) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#7C3AED]/15 flex items-center justify-center shrink-0">
                        <GitCommit size={14} className="text-[#7C3AED]" />
                      </div>
                      {i < commits.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{c.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-[#64748B] flex items-center gap-1">
                          <Calendar size={9} /> {c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="text-[9px] text-[#64748B]">{c.sha?.substring(0, 7)}</span>
                      </div>
                    </div>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <ExternalLink size={12} className="text-[#64748B] hover:text-white transition-colors" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <GitCommit size={28} className="text-[#64748B] mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">{commitsLoading ? 'Loading commits...' : 'Click "Load Commits" to fetch'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Commits', value: profile.totalCommits || 0, icon: GitCommit, color: '#7C3AED' },
            { label: 'Repositories', value: repos.length || '—', icon: FolderGit2, color: '#F59E0B' },
            { label: 'Last Commit', value: profile.lastCommitAt ? timeAgo(profile.lastCommitAt) : 'N/A', icon: Clock, color: '#00D4FF' },
            { label: 'Status', value: 'Connected', icon: Link2, color: '#10B981' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}15` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-[#94A3B8]">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="glass-card p-5 border-[#00D4FF]/10">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-[#00D4FF]" /> How GitHub Sync Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Write Code', desc: 'Complete coding challenges in the Practice Lab or Learning Interface' },
              { step: '02', title: 'Auto-Save', desc: 'Your code is automatically pushed to the `skillbridge-portfolio` repo' },
              { step: '03', title: 'Build Portfolio', desc: 'Recruiters can view your organized, version-controlled code portfolio' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl font-bold text-[#00D4FF]/20">{s.step}</span>
                <div>
                  <h4 className="text-sm text-white font-bold">{s.title}</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
