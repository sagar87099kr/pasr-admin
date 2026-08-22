'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAction } from '@/lib/actions';

type AdvertisementViewProps = {
  stats: { pending: number | string; verified: number | string; rejected: number | string };
  requests: any[];
  title: string;
  description: string;
};

export default function AdvertisementView({ stats, requests, title, description }: AdvertisementViewProps) {
  const [data, setData] = useState<any[]>(requests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    phoneNumber: '',
    startTime: '',
    endTime: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Image is required");
      return;
    }
    
    setLoading(true);
    const formPayload = new FormData();
    formPayload.append('image', imageFile);
    formPayload.append('title', formData.title);
    formPayload.append('link', formData.link);
    formPayload.append('phoneNumber', formData.phoneNumber);
    formPayload.append('startTime', formData.startTime);
    formPayload.append('endTime', formData.endTime);

    try {
      const res = await fetch('/api/admin/advertisements', {
        method: 'POST',
        body: formPayload
      });
      const result = await res.json();
      if (result.success) {
        alert("Advertisement created successfully");
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert(result.message || "Failed to create advertisement");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating advertisement");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    try {
      const res = await handleAction(currentlyActive ? 'REJECT' : 'VERIFY', 'advertisements', id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    try {
      const res = await handleAction('DELETE', 'advertisements', id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50 relative">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            + Create Advertisement
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-sm font-semibold text-gray-500 mb-2">Active Ads</div>
            <div className="text-4xl font-extrabold text-emerald-600">{stats.verified}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-sm font-semibold text-gray-500 mb-2">Inactive Ads</div>
            <div className="text-4xl font-extrabold text-amber-600">{stats.pending}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Ad Info</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 align-middle">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt="Ad" className="w-16 h-12 rounded-lg object-cover bg-gray-100 shadow-sm border border-gray-200" />
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{item.title}</span>
                          <span className="text-xs text-gray-400 mt-0.5">{item.raw?.phoneNumber || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-xs text-gray-800">Start: {new Date(item.raw?.startTime).toLocaleString()}</div>
                      <div className="text-xs text-gray-800 mt-1">End: {new Date(item.raw?.endTime).toLocaleString()}</div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status === 'Verified' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 align-middle">
                      <div className="flex gap-2 justify-end items-center">
                        <button 
                          onClick={() => handleToggleActive(item.id, item.status === 'Verified')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-md transition-colors text-xs"
                        >
                          Toggle
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-md transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">Create New Advertisement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Image</label>
                <input required type="file" accept="image/*" onChange={handleImageChange} className="w-full border rounded-lg p-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Time</label>
                  <input required type="datetime-local" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Time</label>
                  <input required type="datetime-local" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Link (Optional)</label>
                <input type="url" name="link" value={formData.link} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number (Optional)</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
