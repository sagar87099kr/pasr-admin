import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header from old design */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-end z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-600">Connected</span>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm ml-2">
              AD
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
