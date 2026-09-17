import React, { useState } from 'react';
import { X, Database, Check, RefreshCw, AlertTriangle, HardDrive, ShieldCheck } from 'lucide-react';
import type { DatabaseStats } from '../../types';
;

interface ProjectSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DatabaseStats | null;
  onResetDatabase: () => Promise<void>;
}

export const ProjectSwitcherModal: React.FC<ProjectSwitcherModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetDatabase,
}) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (
      confirm(
        'Восстановить исходные демонстрационные данные? Все текущие задачи и планы будут возвращены к начальному состоянию.'
      )
    ) {
      setResetting(true);
      try {
        await onResetDatabase();
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 2500);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-12 px-4 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80]">
              <Database className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-[#f0f6fc]">
              Параметры базы данных
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-[#1c2026] flex items-center justify-center text-[#6e7681] hover:text-[#f0f6fc] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 text-xs">
          {/* Active DB Card */}
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#38bdf8]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse" />
              <div>
                <div className="font-mono font-semibold text-[#f0f6fc]">production-db</div>
                <div className="text-[11px] text-[#6e7681]">
                  SQLite (локальная база данных)
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
              АКТИВНА
            </span>
          </div>

          {/* Configuration Parameters */}
          <div className="flex flex-col gap-2 text-[12px]">
            <div className="flex justify-between py-1 border-b border-[#21262d]">
              <span className="text-[#6e7681]">Движок:</span>
              <span className="text-[#f0f6fc] font-mono">SQLite 3.42</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#21262d]">
              <span className="text-[#6e7681]">Режим:</span>
              <span className="text-[#4ade80] font-mono font-semibold">{stats?.journalMode || 'WAL'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#21262d]">
              <span className="text-[#6e7681]">Всего задач:</span>
              <span className="text-[#f0f6fc] font-semibold">{stats?.totalTasks ?? 24}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#21262d]">
              <span className="text-[#6e7681]">Всего планов:</span>
              <span className="text-[#f0f6fc] font-semibold">{stats?.totalPlans ?? 4}</span>
            </div>
          </div>

          {/* Reset Notice & Button */}
          <div className="mt-2 p-3 rounded bg-[#181c22] border border-[#21262d] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#fbbf24]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-[11px]">Сброс демонстрационных данных</span>
            </div>
            <p className="text-[#8b949e] text-[11px] leading-relaxed">
              Восстанавливает базу данных к начальному набору задач и планов.
            </p>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="mt-1 h-8 rounded bg-[#1c2026] hover:bg-[#262a31] border border-[#30363d] text-[#f0f6fc] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {resetting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : resetSuccess ? (
                <Check className="w-3.5 h-3.5 text-[#4ade80]" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[#38bdf8]" />
              )}
              <span>{resetSuccess ? 'Готово!' : 'Сбросить данные'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#161b22] border-t border-[#21262d] flex justify-end">
          <button
            onClick={onClose}
            className="h-7 px-3.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-[#21262d] text-xs text-[#f0f6fc] cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
