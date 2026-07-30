'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useRouter } from 'next/navigation';

type DashboardData = {
  todayStats: {
    numberOfOrders: number;
    totalOrderPrice: number;
    coinsUsed: number;
    pasrRevenue: number;
  };
  graphData: {
    date: string;
    orders: number;
    revenue: number;
    coins: number;
    amount: number;
  }[];
};

type DashboardViewProps = {
  title: string;
  description: string;
  dashboardData: DashboardData | null;
};

export default function DashboardView({ title, description, dashboardData }: DashboardViewProps) {
  const router = useRouter();

  if (!dashboardData) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium text-lg">Loading dashboard data...</p>
          <p className="text-gray-400 text-sm mt-2">If this takes too long, the backend server might be offline or failing to connect to the database.</p>
        </div>
      </div>
    );
  }

  const { todayStats, graphData } = dashboardData;

  const statsCards = [
    { label: 'Orders Today', value: todayStats.numberOfOrders, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Sales Today (₹)', value: `₹${todayStats.totalOrderPrice.toFixed(2)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Coins Used Today', value: todayStats.coinsUsed, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'PaSr Revenue (₹)', value: `₹${todayStats.pasrRevenue.toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50 relative">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <div 
              key={i} 
              className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1`}
            >
              <div className="text-sm font-semibold text-gray-500 mb-2">{stat.label}</div>
              <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue & Sales (7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="amount" name="Total Sales (₹)" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                  <Area type="monotone" dataKey="revenue" name="PaSr Revenue (₹)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders & Coins Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Orders & Coins Used (7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="coins" name="Coins Used" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
