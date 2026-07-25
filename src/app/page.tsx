'use client';

import { useState } from 'react';

const ADMIN_NUMBERS = [
  "8709956547", "7091212569", "7046699074", 
  "9304703911", "8873679038", "7091568049", "9835780962", "9352462475"
];

export default function AdminLogin() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://www.pasr.in/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: mobile,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Check if user is an admin
      if (!ADMIN_NUMBERS.includes(mobile)) {
        setError('Access denied. You do not have admin privileges.');
        setLoading(false);
        return;
      }

      // User is verified and is an admin
      await fetch('/api/auth/set-admin-cookie', { method: 'POST' });
      window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-500/20 to-teal-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2 tracking-tight">
              PaSr Admin
            </h1>
            <p className="text-gray-400 font-medium">Secure Portal Access</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Only authorized personnel can access this portal. All access is logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
