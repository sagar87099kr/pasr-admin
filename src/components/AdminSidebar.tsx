'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isMobileOpen = false, closeSidebar = () => {} }: { isMobileOpen?: boolean; closeSidebar?: () => void }) {
  const pathname = usePathname();

  const routes = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Payouts', path: '/admin/payouts' },
    { name: 'Delivery Partners', path: '/admin/delivery-partners' },
    { name: 'Shop Verification', path: '/shops/verify' },
    { name: 'Provider Verification', path: '/provider/verify' },
    { name: 'Bazaars', path: '/admin/bazaars' },
    { name: 'Product Verification', path: '/product/verify' },
    { name: 'Item Verification', path: '/items/verify' },
    { name: 'Kisan Sabha', path: '/admin/kisan-sabha' },
    { name: 'Partner Cash', path: '/admin/partner-cash' },
    { name: 'Advertisements', path: '/admin/advertisements' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed md:sticky top-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">PaSr Admin</h1>
            <p className="text-xs text-green-600 font-bold mt-1">Live Backend: pasr.in</p>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {routes.map((route) => {
            const isActive = pathname === route.path;
            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={closeSidebar}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-transparent'}`} />
                <span>{route.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Link href="/" className="flex justify-center w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
