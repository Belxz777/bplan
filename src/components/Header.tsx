import React from 'react';
import {
  Database,
  Search,
  Plus,
  Download,
  Code2,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
  Briefcase,
} from 'lucide-react';
import type { EntityView, User } from '../..//types';

interface HeaderProps {
  currentView: EntityView;
  searchQuery: string;
  currentUser: User | null;
  onSearchChange: (q: string) => void;
  onOpenNewTask: () => void;
  onOpenNewPlan: () => void;
  onOpenNewUser: () => void;
  onOpenNewPosition: () => void;
  onOpenApiExplorer: () => void;
  onOpenProjectModal: () => void;
  onOpenCommandPalette: () => void;
  onExportData: () => void;
  onLogout: () => void;
  onSwitchToLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  currentUser,
  onSearchChange,
  onOpenNewTask,
  onOpenNewPlan,
  onOpenNewUser,
  onOpenNewPosition,
  onOpenApiExplorer,
  onOpenProjectModal,
  onOpenCommandPalette,
  onExportData,
  onLogout,
  onSwitchToLogin,
}) => {
  return (
    <header className="h-[52px] min-h-[52px] border-b border-[#21262d] bg-[#161b22] px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand & Project Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0284c7]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
            <Database className="w-4 h-4" />
          </div>
          <span className="font-semibold text-[#f0f6fc] text-[15px] tracking-tight">
            BPlan
          </span>
        </div>

        <div className="h-4 w-px bg-[#30363d]" />

        {/* Project / DB Status button */}
        <button
          onClick={onOpenProjectModal}
          className="flex items-center gap-2 bg-[#0d1117] hover:bg-[#262a31] px-2.5 py-1 rounded-md border border-[#21262d] text-xs transition-colors cursor-pointer group"
          title="Параметры базы данных"
        >
          <div className="h-2 w-2 rounded-full bg-[#4ade80] animate-pulse" />
          <span className="font-mono text-[#f0f6fc] font-medium">База данных</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#f0f6fc] transition-colors" />
        </button>
      </div>

      {/* Central Search Bar with ⌘K */}
      <div className="w-full max-w-md hidden md:flex items-center relative">
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6e7681] pointer-events-none" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClick={onOpenCommandPalette}
          className="w-full h-8 pl-8 pr-12 bg-[#0d1117] hover:bg-[#1c2026] focus:bg-[#1c2026] border border-[#21262d] focus:border-[#38bdf8]/50 rounded-md text-[#f0f6fc] placeholder-[#6e7681] text-xs outline-none transition-all cursor-text"
          placeholder="Поиск по задачам, планам, сотрудникам (⌘K)..."
        />
        <button
          onClick={onOpenCommandPalette}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-[#262a31] text-[#8b949e] hover:text-[#f0f6fc] px-1.5 py-0.5 rounded border border-[#30363d] cursor-pointer"
        >
          ⌘K
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Contextual Quick Add Button */}
        {currentView === 'tasks' && (
          <button
            onClick={onOpenNewTask}
            className="h-8 px-2.5 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-[#0b0f19] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Задача</span>
          </button>
        )}

        {currentView === 'plans' && (
          <button
            onClick={onOpenNewPlan}
            className="h-8 px-2.5 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-[#0b0f19] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ План</span>
          </button>
        )}

        {currentView === 'users' && (
          <button
            onClick={onOpenNewUser}
            className="h-8 px-2.5 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-[#0b0f19] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Пользователь</span>
          </button>
        )}

        {currentView === 'positions' && (
          <button
            onClick={onOpenNewPosition}
            className="h-8 px-2.5 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-[#0b0f19] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Должность</span>
          </button>
        )}

        <div className="h-4 w-px bg-[#30363d] mx-0.5" />

        {/* REST API Explorer Button */}
        <button
          onClick={onOpenApiExplorer}
          className="h-8 px-2.5 rounded-md bg-[#0d1117] hover:bg-[#1c2026] border border-[#21262d] flex items-center gap-1.5 text-xs font-mono text-[#7bd0ff] hover:text-[#f0f6fc] transition-colors cursor-pointer"
          title="Интерактивный просмотр API эндпоинтов"
        >
          <Code2 className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>API</span>
        </button>

        {/* Export Data Button */}
        <button
          onClick={onExportData}
          className="h-8 w-8 rounded-md bg-[#0d1117] hover:bg-[#1c2026] border border-[#21262d] flex items-center justify-center text-[#8b949e] hover:text-[#f0f6fc] transition-colors cursor-pointer"
          title="Экспорт базы данных в JSON"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#30363d] mx-0.5" />

        {/* User Profile / Logout */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-2 px-2 py-1 bg-[#0d1117] border border-[#21262d] rounded-md">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-[#30363d]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center text-[10px] font-bold">
                  {(currentUser.full_name || currentUser.username)
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-medium text-[#f0f6fc]">
                  {currentUser.full_name || currentUser.username}
                </span>
                <span className="text-[9px] font-mono text-[#8b949e]">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="h-8 px-2 rounded-md bg-[#0d1117] hover:bg-[#7f1d1d]/20 border border-[#21262d] hover:border-[#f87171]/40 text-[#8b949e] hover:text-[#f87171] flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              title="Выйти из аккаунта"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выход</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onSwitchToLogin}
            className="h-8 px-3 rounded-md bg-[#38bdf8] hover:bg-[#0284c7] text-[#0b0f19] font-medium text-xs transition-colors cursor-pointer"
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
};
