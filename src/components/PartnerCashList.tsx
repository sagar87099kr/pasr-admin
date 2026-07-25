'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markRemitted } from '@/lib/actions';

type PartnerCashProps = {
  stats: { pending: number | string; verified: number | string; rejected: number | string };
  requests: any[];
};

export default function PartnerCashList({ stats, requests }: PartnerCashProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const handleRemit = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to mark this cash as paid/collected?')) return;
    
    setProcessingId(groupId);
    try {
      const res = await markRemitted(groupId);
      if (!res.success) {
        alert(res.error || 'Failed to mark as paid');
      } else {
        router.refresh();
      }
    } catch (e: any) {
      alert(e.message || 'Error marking as paid');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Partner Cash Collection</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Track and collect Cash-on-Delivery amounts from partners.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Collections</p>
              <h3 className="text-3xl font-black text-amber-500 mt-1">{stats.pending}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Settled (Paid)</p>
              <h3 className="text-3xl font-black text-emerald-500 mt-1">{stats.verified}</h3>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {requests.slice(0, visibleCount).map((group, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{group.raw.partnerName}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      group.raw.remitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {group.raw.remitted ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">{group.time}</span> • Phone: {group.raw.partnerPhone || 'N/A'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total to Collect</p>
                    <p className="text-2xl font-black text-indigo-600">₹{group.raw.totalAmount}</p>
                  </div>
                  
                  {!group.raw.remitted && (
                    <button
                      onClick={() => handleRemit(group.id)}
                      disabled={processingId === group.id}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {processingId === group.id ? 'Processing...' : 'Mark as Paid'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Order ID</th>
                        <th className="pb-2 font-medium text-right">Amount Collected</th>
                        <th className="pb-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {group.raw.orders.map((order: any, oIdx: number) => (
                        <tr key={oIdx}>
                          <td className="py-2 font-mono text-gray-600">{order.orderId}</td>
                          <td className="py-2 font-bold text-gray-900 text-right">₹{order.amount}</td>
                          <td className="py-2 text-right">
                            {order.remitted ? (
                              <span className="text-emerald-600 font-semibold text-xs">Settled</span>
                            ) : (
                              <span className="text-amber-600 font-semibold text-xs">Unsettled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
          
          {requests.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              No COD orders found.
            </div>
          )}
        </div>
        
        {visibleCount < requests.length && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg shadow-sm transition-all"
            >
              Load More (Showing {visibleCount} of {requests.length})
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
