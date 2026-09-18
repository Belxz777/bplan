import React, { useState, useEffect } from 'react';
import type { User, Position } from '../../types';
import {
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register extra fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [positionId, setPositionId] = useState<number | ''>('');
  const [positions, setPositions] = useState<Position[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load available positions for registration dropdown
  useEffect(() => {
    fetch('/api/positions')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPositions(data))
      .catch(() => setPositions([]));
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginInput.trim() || !password) {
      setError('Введите логин или email и пароль');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginInput.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !password) {
      setError('Заполните обязательные поля: Email, Логин и Пароль');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password,
      }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      setSuccessMessage('Регистрация прошла успешно! Выполняется вход...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 700);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-[#f0f6fc] flex flex-col justify-center items-center px-4 py-8 relative select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-6 md:p-8 relative z-10 flex flex-col">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-11 h-11 rounded-lg bg-[#21262d] border border-[#38bdf8]/30 flex items-center justify-center mb-3 shadow-inner">
            <Shield className="w-6 h-6 text-[#38bdf8]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#f0f6fc]">
            BPlan Управление
          </h1>
       
        </div>

        {/* Tab selector: Вход / Регистрация */}
        <div className="grid grid-cols-2 p-1 bg-[#0b0f19] rounded-lg border border-[#21262d] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#21262d] text-[#f0f6fc] shadow-sm'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Вход</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-[#21262d] text-[#f0f6fc] shadow-sm'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Регистрация</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 px-3 py-2.5 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg flex items-start gap-2 text-xs text-[#f85149]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="mb-4 px-3 py-2.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg flex items-start gap-2 text-xs text-[#3fb950]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                Логин или Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="admin@bplan.dev или admin"
                  className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-2 pl-9 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none transition-colors"
                />
                <UserIcon className="w-4 h-4 text-[#6e7681] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#c9d1d9]">
                  Пароль
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-2 pl-9 pr-9 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-[#6e7681] absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#6e7681] hover:text-[#c9d1d9] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0b0f19] font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Вход...' : 'Войти'}</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Email <span className="text-[#f85149]">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-2 pl-9 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-[#6e7681] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Имя пользователя (логин) <span className="text-[#f85149]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="например, alex_pro"
                  className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-2 pl-9 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none transition-colors"
                />
                <UserIcon className="w-4 h-4 text-[#6e7681] absolute left-3 top-2.5" />
              </div>
            </div>

            

  

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                Пароль (минимум 8 символов) <span className="text-[#f85149]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-2 pl-9 pr-9 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-[#6e7681] absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#6e7681] hover:text-[#c9d1d9] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0b0f19] font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Создание...' : 'Зарегистрироваться'}</span>
            </button>
          </form>
        )}

        {/* Quick Demo Credentials */}
      
      </div>
    </div>
  );
};
