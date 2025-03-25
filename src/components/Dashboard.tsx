import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Award, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

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
      if (!user) return;

      const [profileData, tasksData, submissionsData, transactionsData] = await Promise.all([
        supabase.from('profiles').select('points').eq('id', user.id).single(),
        supabase.from('tasks').select('id').eq('creator_id', user.id),
        supabase.from('task_submissions').select('id, status').eq('user_id', user.id),
        supabase.from('transactions')
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
      setLoading(false);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Points</p>
              <h3 className="text-2xl font-bold">{stats.totalPoints}</h3>
            </div>
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Tasks Created</p>
              <h3 className="text-2xl font-bold">{stats.tasksCreated}</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Tasks Completed</p>
              <h3 className="text-2xl font-bold">{stats.tasksCompleted}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending Submissions</p>
              <h3 className="text-2xl font-bold">{stats.pendingSubmissions}</h3>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {stats.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  {transaction.type === 'earned' ? (
                    <div className="bg-green-100 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-red-100 p-2 rounded-full">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} points
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/wallet"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              View all transactions
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}