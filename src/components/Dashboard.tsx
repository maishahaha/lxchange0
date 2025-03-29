import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Award, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface DashboardStats {
  totalPoints: number;
  tasksCreated: number;
  tasksCompleted: number;
  pendingSubmissions: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    created_at: string;
  }>;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0,
    tasksCreated: 0,
    tasksCompleted: 0,
    pendingSubmissions: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return;

      try {
        // Ensure profile exists before fetching data
        await supabase
          .from('profiles')
          .upsert({ id: user.id }, { onConflict: 'id' });

        const [profileData, tasksData, submissionsData, transactionsData] = await Promise.all([
          supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('tasks')
            .select('id')
            .eq('creator_id', user.id),
          supabase
            .from('task_submissions')
            .select('id, status')
            .eq('user_id', user.id),
          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalPoints: profileData.data?.points || 0,
          tasksCreated: tasksData.data?.length || 0,
          tasksCompleted: submissionsData.data?.filter(s => s.status === 'approved').length || 0,
          pendingSubmissions: submissionsData.data?.filter(s => s.status === 'pending').length || 0,
          recentTransactions: transactionsData.data || [],
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200">Total Points</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.totalPoints}</h3>
            </div>
            <div className="bg-blue-500/30 p-3 rounded-xl">
              <Award className="h-8 w-8 text-blue-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200">Tasks Created</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.tasksCreated}</h3>
            </div>
            <div className="bg-purple-500/30 p-3 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200">Tasks Completed</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.tasksCompleted}</h3>
            </div>
            <div className="bg-indigo-500/30 p-3 rounded-xl">
              <CheckCircle className="h-8 w-8 text-indigo-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-200">Pending Submissions</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.pendingSubmissions}</h3>
            </div>
            <div className="bg-cyan-500/30 p-3 rounded-xl">
              <Clock className="h-8 w-8 text-cyan-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
            <Link
              to="/wallet"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'earned'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.type === 'earned' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{transaction.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'earned' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} points
                </span>
              </div>
            ))}

            {stats.recentTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}