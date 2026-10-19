import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Building,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PLATFORM_CONFIG } from '@vflow/shared';

export const ProviderPayouts: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['providerPayoutsData'],
    queryFn: () => api.provider.getPayouts(),
  });

  const payouts = data?.payouts || [];
  const ledger = data?.ledger || [];
  const summary = data?.summary;

  const pendingNextDayRupees = summary
    ? (summary.pendingNextDayPaise / 100).toFixed(2)
    : '450.00';
  const paidTotalRupees = summary ? (summary.paidTotalPaise / 100).toFixed(2) : '1,350.00';
  const nextCutoffDate = summary?.nextCutoffDate || 'Tomorrow 12:00 PM';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <CreditCard className="w-4 h-4" />
          <span>Settlement System</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">
          Next-Day Provider Earnings & Payout Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Mandatory next-day calendar cutoff for verified parking and EV charging sessions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 uppercase">
            <span>Queued for Next-Day Payout</span>
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-950">₹{pendingNextDayRupees}</div>
          <div className="text-xs text-emerald-800">
            Target Disbursement: <strong className="font-semibold">{nextCutoffDate}</strong>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Payouts Completed</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{paidTotalRupees}</div>
          <div className="text-xs text-slate-500">Transferred via Razorpay Route / NEFT</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Platform Commission Policy</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {PLATFORM_CONFIG.DEFAULT_COMMISSION_PERCENTAGE}%
          </div>
          <div className="text-xs text-slate-500">
            Integer paise precision · No hidden payment processing surcharges
          </div>
        </div>
      </div>

      {/* Next-Day Settlement Explanation Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>How Next-Day Settlement Works</span>
          </div>
          <h3 className="text-lg font-bold">Standard 24-Hour Settlement Cycle</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When a driver books and completes their parking stay or charging session, VFlow automatically calculates your net share (Gross minus 10% platform commission) and queues it in the ledger. Funds are disbursed on the immediate next calendar day to your verified bank or UPI ID.
          </p>
        </div>
        <div className="shrink-0 bg-slate-800 p-4 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1 text-center w-full sm:w-auto">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Daily Cutoff Time</div>
          <div className="font-mono font-bold text-white text-sm">18:30 UTC / 00:00 IST</div>
        </div>
      </div>

      {/* Date-wise Financial Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Financial Ledger Entries (Paise Precision)</h2>
          <span className="text-xs text-slate-500 font-semibold">{ledger.length} entries</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Gross Transaction</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Net Payable</th>
                  <th className="p-4">Target Payout Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.length > 0 ? (
                  ledger.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-slate-600">
                        {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 capitalize">
                          {entry.entryType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ₹{(entry.grossAmountPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 font-semibold text-red-600">
                        -₹{(entry.platformCommissionPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 font-extrabold text-emerald-700">
                        ₹{(entry.netPayablePaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        {entry.targetPayoutDate || 'Next Day'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            entry.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.status === 'eligible'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No ledger transactions found yet. Completed bookings will appear here immediately.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
