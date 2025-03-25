import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export function WalletDashboard() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [user]);

  async function loadWalletData() {
    if (!user) return;

    try {
      const [profileData, transactionsData] = await Promise.all([
        supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single(),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (profileData.data) {
        setBalance(profileData.data.points);
      }

      if (transactionsData.data) {
        setTransactions(transactionsData.data);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleWithdraw = async () => {
    if (!user || withdrawLoading) return;

    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    setWithdrawLoading(true);
    try {
      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: amount,
        type: 'withdrawn',
        description: 'Points withdrawal request',
      });

      if (transactionError) throw transactionError;

      await supabase.rpc('update_user_points', {
        user_id: user.id,
        points_to_add: -amount,
      });

      setWithdrawAmount('');
      await loadWalletData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Wallet</h2>
            <p className="text-gray-600">Manage your points and withdrawals</p>
          </div>
          <button
            onClick={loadWalletData}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Available Balance</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{balance} points</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Withdraw Points</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                min="1"
                max={balance}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || parseInt(withdrawAmount) > balance}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {withdrawLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Transaction History</h3>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border-b last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'earned'
                    ? 'bg-green-100'
                    : transaction.type === 'withdrawn'
                    ? 'bg-orange-100'
                    : 'bg-red-100'
                }`}>
                  {transaction.type === 'earned' ? (
                    <ArrowUpRight className={`h-5 w-5 text-green-600`} />
                  ) : transaction.type === 'withdrawn' ? (
                    <Wallet className={`h-5 w-5 text-orange-600`} />
                  ) : (
                    <ArrowDownRight className={`h-5 w-5 text-red-600`} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${
                transaction.type === 'earned'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} points
              </span>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}