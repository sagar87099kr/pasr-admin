'use client';

import { useState } from 'react';

type DataListProps = {
  tabName: string;
  stats: { pending: number | string; verified: number | string; rejected: number | string };
  requests: any[];
  title: string;
  description: string;
  bazaarsList?: { id: string; name: string }[];
};

import { useRouter } from 'next/navigation';
import { assignBazaar, assignDeliveryCategory, assignItemDeliveryCategory, deleteRecord, updateRecordPrice } from '@/lib/actions';

export default function DataList({ tabName, stats, requests, title, description, bazaarsList }: DataListProps) {
  const [selectedBazaars, setSelectedBazaars] = useState<Record<string, string>>({});
  const [selectedDeliveryCategories, setSelectedDeliveryCategories] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(10);
  const [filterBazaarId, setFilterBazaarId] = useState<string>('all');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [updatingPrice, setUpdatingPrice] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const filteredRequests = requests.filter(req => {
    if (filterBazaarId && filterBazaarId !== 'all') {
      return req.raw?.bazaarId === filterBazaarId;
    }
    return true;
  });

  const handleAssignBazaar = async (providerId: string, bazaarId: string) => {
    if (!bazaarId) return;
    setAssigning(prev => ({ ...prev, [providerId]: true }));
    try {
      const res = await assignBazaar(providerId, bazaarId, tabName as 'providers' | 'shops');
      if (!res.success) {
        alert(res.error || 'Failed to assign bazaar');
      } else {
        alert('Bazaar assigned successfully!');
      }
    } catch (e: any) {
      alert(e.message || 'Error assigning bazaar');
    } finally {
      setAssigning(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleAssignDeliveryCategory = async (productId: string, category: string) => {
    if (!category) return;
    setAssigning(prev => ({ ...prev, [productId]: true }));
    try {
      let res;
      if (tabName === 'items') {
        res = await assignItemDeliveryCategory(productId, category);
      } else {
        res = await assignDeliveryCategory(productId, category);
      }
      
      if (!res.success) {
        alert(res.error || 'Failed to assign delivery category');
      } else {
        alert('Delivery category assigned successfully!');
      }
    } catch (e: any) {
      alert(e.message || 'Error assigning delivery category');
    } finally {
      setAssigning(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleDeleteRecord = async (recordId: string, tabName: string) => {
    if (window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      try {
        const collectionMap: Record<string, string> = {
          'products': 'products',
          'items': 'items',
          'providers': 'providers',
          'shops': 'shops',
          'payouts': 'transactionhistories',
          'bazaars': 'bazaars',
          'kisan-sabha': 'kisanSabhas',
        };
        const collectionName = collectionMap[tabName] || tabName;
        const res = await deleteRecord(collectionName, recordId);
        if (!res.success) {
          alert(res.error || 'Failed to delete record');
        } else {
          window.location.reload();
        }
      } catch (e: any) {
        alert(e.message || 'Error deleting record');
      }
    }
  };

  const handleUpdatePrice = async (recordId: string) => {
    const item = requests.find(r => r.raw._id === recordId);
    if (!item) return;

    const newPrice = editedPrices[item.id];
    if (newPrice === undefined || newPrice < 0) return;
    
    setUpdatingPrice(prev => ({ ...prev, [recordId]: true }));
    try {
      const res = await updateRecordPrice(tabName, recordId, newPrice);
      if (!res.success) {
        alert(res.error || 'Failed to update price');
      } else {
        alert('Price updated successfully!');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating price');
    } finally {
      setUpdatingPrice(prev => ({ ...prev, [recordId]: false }));
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50 relative">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: tabName === 'orders' ? 'Pending Orders' : tabName === 'payouts' ? 'Total Payouts' : tabName === 'dashboard' ? 'Today\'s Customer Purchases' : 'Pending Verification', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', link: tabName === 'dashboard' ? '/admin/orders?date=today' : undefined },
            { label: tabName === 'orders' ? 'Completed Orders' : tabName === 'payouts' ? 'Settled' : tabName === 'dashboard' ? 'Today\'s Shop Payouts' : 'Verified / Active', value: stats.verified, color: 'text-emerald-600', bg: 'bg-emerald-50', link: tabName === 'dashboard' ? '/admin/payouts?date=today' : undefined },
            { label: tabName === 'orders' ? 'Cancelled Orders' : tabName === 'payouts' ? 'Failed' : tabName === 'dashboard' ? 'Active Partners' : 'Rejected', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-50', link: tabName === 'dashboard' ? '/admin/delivery-partners' : undefined }
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all ${stat.link ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-indigo-200 active:scale-95' : ''}`}
              onClick={() => stat.link && router.push(stat.link)}
            >
              <div className="text-sm font-semibold text-gray-500 mb-2">{stat.label}</div>
              <div className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* List Area -> Now a Data Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">{tabName === 'dashboard' ? 'Daily Transactions' : 'Recent Requests'}</h3>
            <div className="flex gap-4">
              {bazaarsList && bazaarsList.length > 0 && (
                <select 
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white min-w-[150px]"
                  value={filterBazaarId}
                  onChange={(e) => { setFilterBazaarId(e.target.value); setVisibleCount(10); }}
                >
                  <option value="all">All Bazaars</option>
                  {bazaarsList.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
              <input 
                type="text" 
                placeholder="Search..." 
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Details</th>
                  {tabName === 'orders' && <th className="p-4">Customer Info</th>}
                  {tabName === 'orders' && <th className="p-4">Shop Info</th>}
                  {tabName === 'orders' && <th className="p-4">Delivery Info</th>}
                  {tabName === 'orders' && <th className="p-4">Total Amount</th>}
                  {(tabName === 'products' || tabName === 'items') && <th className="p-4">Price / M.R.P.</th>}
                  {(tabName === 'products' || tabName === 'items') && <th className="p-4">Store Location</th>}
                  {(tabName === 'payouts') && <th className="p-4">Shop</th>}
                  {(tabName === 'payouts') && <th className="p-4">Amount</th>}
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.slice(0, visibleCount).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* DETAILS COLUMN */}
                    <td className="p-4 pl-6 align-middle">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="Thumb" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shadow-sm border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center font-bold text-indigo-400 text-xs border border-indigo-100">{item.id}</div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{item.title || `Request #${item.id}`}</span>
                          <span className="text-xs text-gray-400 mt-0.5 font-mono">{item.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* ORDERS SPECIFIC COLUMNS */}
                    {tabName === 'orders' && (
                      <td className="p-4 align-middle">
                        <div className="text-sm font-bold text-gray-800">{item.raw?.customerName || item.raw?.customerId}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.raw?.customerPhone || 'No Phone'}</div>
                        {item.raw?.deliveryAddress && (
                          <div className="text-[10px] text-gray-400 mt-1 max-w-[150px] whitespace-normal leading-tight">
                            📍 {item.raw.deliveryAddress}
                          </div>
                        )}
                      </td>
                    )}
                    {tabName === 'orders' && (
                      <td className="p-4 align-middle">
                        <div className="text-sm font-bold text-gray-800">{item.raw?.shopName || 'Unknown Shop'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.raw?.shopPhone || 'No Phone'}</div>
                      </td>
                    )}
                    {tabName === 'orders' && (
                      <td className="p-4 align-middle">
                        <div className="text-sm font-bold text-gray-800">{item.raw?.partnerName || 'Unassigned'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.raw?.partnerPhone || '-'}</div>
                      </td>
                    )}
                    {tabName === 'orders' && (
                      <td className="p-4 align-middle">
                        <div className="text-sm font-extrabold text-emerald-600">₹{item.raw?.totalAmount || 0}</div>
                        <div className="text-xs text-gray-500 mt-0.5 font-medium">{item.raw?.paymentType || 'COD'}</div>
                      </td>
                    )}

                    {/* PRODUCTS / ITEMS SPECIFIC COLUMNS */}
                    {(tabName === 'products' || tabName === 'items') && (
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-500">₹</span>
                            <input 
                              type="number"
                              className="bg-white border border-gray-200 text-sm font-bold text-gray-800 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-20"
                              value={editedPrices[item.id] !== undefined ? editedPrices[item.id] : (item.raw.price || 0)}
                              onChange={(e) => setEditedPrices(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                              min="0"
                            />
                            <button 
                              onClick={() => handleUpdatePrice(item.raw._id)}
                              disabled={updatingPrice[item.raw._id] || editedPrices[item.id] === undefined || editedPrices[item.id] === (item.raw.price || 0)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded transition-colors disabled:opacity-0 disabled:pointer-events-none text-xs"
                            >
                              {updatingPrice[item.raw._id] ? '...' : 'Save'}
                            </button>
                          </div>
                          {(() => {
                            const originalPrice = item.raw.price || 0;
                            const discount = item.raw.discount || 0;
                            let finalPrice = originalPrice;
                            
                            if (item.raw.offerPrice && item.raw.offerPrice < originalPrice) {
                              finalPrice = item.raw.offerPrice;
                            } else if (discount > 0) {
                              finalPrice = originalPrice - (originalPrice * discount / 100);
                            }
                            
                            if (finalPrice < originalPrice) {
                              return (
                                <div className="text-xs text-emerald-600 font-bold ml-1">
                                  Final: ₹{Math.round(finalPrice)} <span className="text-gray-400 font-normal line-through ml-1">₹{originalPrice}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                    )}
                    {(tabName === 'products' || tabName === 'items') && (
                      <td className="p-4 align-middle text-sm font-semibold text-gray-700">
                        {item.raw?.bazaarName || item.raw?.shopName || 'N/A'}
                      </td>
                    )}

                    {/* PAYOUTS SPECIFIC COLUMNS */}
                    {(tabName === 'payouts') && (
                      <td className="p-4 align-middle text-sm font-semibold text-gray-700">
                        {item.raw?.shopName || 'Unknown Shop'}
                      </td>
                    )}
                    {(tabName === 'payouts') && (
                      <td className="p-4 align-middle">
                        <div className="text-sm font-extrabold text-indigo-600">₹{item.raw?.amount || 0}</div>
                      </td>
                    )}

                    {/* ACTIONS COLUMN */}
                    <td className="p-4 pr-6 align-middle">
                      <div className="flex gap-2 justify-end items-center">
                        
                        {/* Assign Bazaar (Shops/Providers) */}
                        {(tabName === 'providers' || tabName === 'shops') && bazaarsList && bazaarsList.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-md border border-gray-200">
                            <select 
                              className="bg-white border border-gray-200 text-xs rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              value={selectedBazaars[item.id] || item.raw.bazaar || ''}
                              onChange={(e) => setSelectedBazaars(prev => ({ ...prev, [item.id]: e.target.value }))}
                            >
                              <option value="">Select Bazaar...</option>
                              {bazaarsList.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleAssignBazaar(item.raw._id, selectedBazaars[item.id] || item.raw.bazaar)}
                              disabled={!(selectedBazaars[item.id] || item.raw.bazaar) || assigning[item.raw._id]}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded transition-colors disabled:opacity-50 text-xs"
                            >
                              {assigning[item.raw._id] ? '...' : 'Assign'}
                            </button>
                          </div>
                        )}

                        {/* Assign Delivery Category (Products/Items) */}
                        {(tabName === 'products' || tabName === 'items') && (
                          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-md border border-gray-200">
                            <select 
                              className="bg-white border border-gray-200 text-xs rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              value={selectedDeliveryCategories[item.id] || item.raw.deliveryCategory || 'normal'}
                              onChange={(e) => setSelectedDeliveryCategories(prev => ({ ...prev, [item.id]: e.target.value }))}
                            >
                              <option value="quick">⚡ Quick (25m)</option>
                              <option value="fast">🚚 Fast (90m)</option>
                              <option value="normal">📦 Normal (24h)</option>
                              <option value="not_deliverable">🚫 Visit Shop</option>
                            </select>
                            <button 
                              onClick={() => handleAssignDeliveryCategory(item.raw._id, selectedDeliveryCategories[item.id] || item.raw.deliveryCategory || 'normal')}
                              disabled={assigning[item.raw._id]}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded transition-colors disabled:opacity-50 text-xs"
                            >
                              {assigning[item.raw._id] ? '...' : 'Assign'}
                            </button>
                          </div>
                        )}

                        {/* Delete Button */}
                        {tabName !== 'orders' && tabName !== 'dashboard' && (
                          <button 
                            onClick={() => handleDeleteRecord(item.raw._id, tabName)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-md transition-colors text-xs"
                          >
                            Delete
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {visibleCount < filteredRequests.length && (
            <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/30">
              <button 
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-6 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg shadow-sm transition-all text-sm"
              >
                Load More (Showing {visibleCount} of {filteredRequests.length})
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
