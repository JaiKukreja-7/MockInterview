"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

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
          <h1 className="text-3xl font-bold">Interview History</h1>
          <p className="text-white/60 mt-1">Review your past performance and track improvements.</p>
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
                className="w-full bg-surface/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
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
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-sm font-medium text-white/60">Role & Type</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60">Date</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60">Difficulty</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60 text-right">Score</th>
                  <th className="px-6 py-4 text-sm font-medium text-white/60 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-white/40">Loading history...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-white/40">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-white/20" />
                    </div>
                    <div>No past interviews found.</div>
                  </td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{item.role}</div>
                        <div className="text-sm text-white/50">{item.type}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-primary">{item.total_score || 0}</span>
                        <span className="text-white/40 text-xs">/100</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/results/${item.id}`}>
                          <button className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors group-hover:bg-primary/20 group-hover:text-primary">
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
