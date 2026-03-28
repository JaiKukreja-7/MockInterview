"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setInterviews(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = interviews.filter(i => 
    i.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 py-4 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Interview History</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Review your past performance and track improvements.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search by role or type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <Calendar className="w-4 h-4" />
                <span>Date</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                  <th className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Role & Type</th>
                  <th className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Difficulty</th>
                  <th className="px-6 py-4 text-sm font-medium text-right" style={{ color: 'var(--text-secondary)' }}>Score</th>
                  <th className="px-6 py-4 text-sm font-medium text-center" style={{ color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading history...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'var(--bg-card)' }}>
                      <Search className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div>No past interviews found.</div>
                  </td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.role}</div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.type}</div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDark
                          ? (item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20')
                          : (item.difficulty === 'Easy' ? 'border' : item.difficulty === 'Medium' ? 'border' : 'border')
                         }`}
                         style={!isDark ? {
                           background: item.difficulty === 'Easy' ? '#dcfce7' : item.difficulty === 'Medium' ? '#fef9c3' : '#fee2e2',
                           color: item.difficulty === 'Easy' ? '#166534' : item.difficulty === 'Medium' ? '#854d0e' : '#991b1b',
                           borderColor: item.difficulty === 'Easy' ? '#bbf7d0' : item.difficulty === 'Medium' ? '#fde68a' : '#fecaca',
                         } : undefined}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-primary">{item.total_score || 0}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/results/${item.id}`}>
                          <button className="p-2 rounded-lg transition-colors" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
