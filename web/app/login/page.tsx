"use client";

import Header from '../components/Header';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '../../lib/clientAuth';
import { loginApi } from '../../lib/api';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginApi(username, password);

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        router.push('/');
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan, coba lagi');
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col relative overflow-hidden">

      <Header />

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/30 rounded-full blur-2xl -z-10"></div>

      <div className="flex flex-1 justify-center items-center px-4 py-10">

        <div className="w-full max-w-md bg-white shadow-xl border border-blue-200 rounded-3xl p-10">

          <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-3">
            Masuk 👋
          </h1>

          <p className="text-blue-600/70 text-center mb-8 text-sm">
            Silakan login untuk melanjutkan
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Username */}
            <div>
              <label className="block text-blue-800 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-300 
                  bg-blue-50 text-blue-900 
                  focus:ring-4 focus:ring-blue-300 
                  focus:border-blue-500 outline-none shadow-sm"
                required
              />
            </div>

            <div className="text-xs text-blue-500 -mt-5">        
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-800 font-medium mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-300 
                    bg-blue-50 text-blue-900 
                    focus:ring-4 focus:ring-blue-300 
                    focus:border-blue-500 outline-none shadow-sm"
                  required
                />

                {/* Show / Hide Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 
                text-white font-semibold shadow-lg transition-all active:scale-95"
            >
              Masuk
            </button>

          </form>

          <p className="text-center text-xs text-blue-600 mt-6">
            © {new Date().getFullYear()} MyDimz — All Rights Reserved
          </p>

        </div>
      </div>
    </div>
  );
}
