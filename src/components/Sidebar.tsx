import React from 'react';
import {
  CheckSquare,
  FolderKanban,
  Users,
  Briefcase,
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Shield,
  Award,
} from 'lucide-react';
import type {
  EntityView,
  DatabaseStats,
  TaskStatus,
  TaskPriority,
  PlanStatus,
  ActiveFilters,
} from '../../types';

interface SidebarProps {
  currentView: EntityView;
  onViewChange: (view: EntityView) => void;
  stats: DatabaseStats | null;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onClearFilters: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  stats,
  activeFilters,
  onFilterChange,
}) => {
  const isStatusActive = (status: TaskStatus) =>
    currentView === 'tasks' && activeFilters.status === status;
  const isPriorityActive = (priority: TaskPriority) =>
    currentView === 'tasks' && activeFilters.priority === priority;
  const isLifecycleActive = (lifecycle: PlanStatus) =>
    currentView === 'plans' && activeFilters.planLifecycle === lifecycle;

  const handleStatusClick = (status: TaskStatus) => {
    if (currentView !== 'tasks') {
      onViewChange('tasks');
    }
    if (activeFilters.status === status) {
      onFilterChange({ status: undefined });
    } else {
      onFilterChange({ status });
    }
  };

  const handlePriorityClick = (priority: TaskPriority) => {
    if (currentView !== 'tasks') {
      onViewChange('tasks');
    }
    if (activeFilters.priority === priority) {
      onFilterChange({ priority: undefined });
    } else {
      onFilterChange({ priority });
    }
  };

  const handleLifecycleClick = (lifecycle: PlanStatus) => {
    if (currentView !== 'plans') {
      onViewChange('plans');
    }
    if (activeFilters.planLifecycle === lifecycle) {
      onFilterChange({ planLifecycle: undefined });
    } else {
      onFilterChange({ planLifecycle: lifecycle });
    }
  };

  return (
    <aside className="w-56 shrink-0 bg-[#0d1117] border-r border-[#21262d] flex flex-col justify-between overflow-y-auto select-none">
      <div className="p-3 flex flex-col gap-5">
        {/* Primary Entities Navigation */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681]">
            Разделы
          </div>
          <nav className="flex flex-col gap-0.5">
            {/* 1. Tasks */}
            <button
              onClick={() => {
                onViewChange('tasks');
                onFilterChange({ plan_id: undefined, planLifecycle: undefined });
              }}
              className={`w-full h-8 px-2.5 rounded-md flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'tasks'
                  ? 'bg-[#262a31] text-[#38bdf8]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>Задачи</span>
              </span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                  currentView === 'tasks'
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8]'
                    : 'bg-[#1c2026] text-[#6e7681]'
                }`}
              >
                {stats?.totalTasks ?? 0}
              </span>
            </button>

            {/* 2. Plans */}
            <button
              onClick={() => {
                onViewChange('plans');
                onFilterChange({ status: undefined, priority: undefined });
              }}
              className={`w-full h-8 px-2.5 rounded-md flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'plans'
                  ? 'bg-[#262a31] text-[#38bdf8]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]'
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                <span>Планы</span>
              </span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                  currentView === 'plans'
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8]'
                    : 'bg-[#1c2026] text-[#6e7681]'
                }`}
              >
                {stats?.totalPlans ?? 0}
              </span>
            </button>

            {/* 3. Users */}
            <button
              onClick={() => {
                onViewChange('users');
              }}
              className={`w-full h-8 px-2.5 rounded-md flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'users'
                  ? 'bg-[#262a31] text-[#38bdf8]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Пользователи</span>
              </span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                  currentView === 'users'
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8]'
                    : 'bg-[#1c2026] text-[#6e7681]'
                }`}
              >
                {stats?.totalUsers ?? 0}
              </span>
            </button>

            {/* 4. Positions */}
            <button
              onClick={() => {
                onViewChange('positions');
              }}
              className={`w-full h-8 px-2.5 rounded-md flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'positions'
                  ? 'bg-[#262a31] text-[#38bdf8]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Должности</span>
              </span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                  currentView === 'positions'
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8]'
                    : 'bg-[#1c2026] text-[#6e7681]'
                }`}
              >
                {stats?.totalPositions ?? 0}
              </span>
            </button>
          </nav>
        </div>

        {/* Task Filters (visible when tasks or plans active) */}
        {(currentView === 'tasks' || currentView === 'plans') && (
          <>
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681]">
                Статус задачи
              </div>
              <div className="flex flex-col gap-0.5 text-xs">
                <button
                  onClick={() => handleStatusClick('todo')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isStatusActive('todo')
                      ? 'text-[#38bdf8] bg-[#38bdf8]/10 font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6e7681]" />
                    <span>В очереди</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#6e7681]">
                    {stats?.statusCounts.todo ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => handleStatusClick('in_progress')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isStatusActive('in_progress')
                      ? 'text-[#38bdf8] bg-[#38bdf8]/10 font-medium border border-[#38bdf8]/20'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                    <span className={isStatusActive('in_progress') ? 'text-[#38bdf8]' : ''}>
                      В работе
                    </span>
                  </span>
                  <span
                    className={`text-[11px] font-mono ${
                      isStatusActive('in_progress') ? 'text-[#38bdf8]' : 'text-[#6e7681]'
                    }`}
                  >
                    {stats?.statusCounts.in_progress ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => handleStatusClick('done')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isStatusActive('done')
                      ? 'text-[#4ade80] bg-[#4ade80]/10 font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                    <span>Готово</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#6e7681]">
                    {stats?.statusCounts.done ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => handleStatusClick('cancelled')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isStatusActive('cancelled')
                      ? 'text-[#f87171] bg-[#f87171]/10 font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                    <span>Отменено</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#6e7681]">
                    {stats?.statusCounts.cancelled ?? 0}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681]">
                Приоритет
              </div>
              <div className="flex flex-col gap-0.5 text-xs">
                <button
                  onClick={() => handlePriorityClick('critical')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isPriorityActive('critical')
                      ? 'text-[#f87171] bg-[#7f1d1d]/30 font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#f87171]" />
                    <span>Критический</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#f87171]">
                    {stats?.priorityCounts.critical ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => handlePriorityClick('high')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isPriorityActive('high')
                      ? 'text-[#fbbf24] bg-[#fbbf24]/10 font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SignalHigh className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>Высокий</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#6e7681]">
                    {stats?.priorityCounts.high ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => handlePriorityClick('medium')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isPriorityActive('medium')
                      ? 'text-[#38bdf8] bg-[#38bdf8]/10 font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SignalMedium className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Средний</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#6e7681]">
                    {stats?.priorityCounts.medium ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => handlePriorityClick('low')}
                  className={`w-full h-7 px-2.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    isPriorityActive('low')
                      ? 'text-[#8b949e] bg-[#21262d] font-medium'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2026]/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SignalLow className="w-3.5 h-3.5 text-[#6e7681]" />
                    <span>Низкий</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#6e7681]">
                    {stats?.priorityCounts.low ?? 0}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* User quick view hints */}
        {currentView === 'users' && (
          <div className="p-3 bg-[#161b22] border border-[#21262d] rounded-lg text-xs flex flex-col gap-2">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681] flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#38bdf8]" />
              <span>Ролевая модель</span>
            </div>
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              Управление доступом к системе, статусами активности и учетными записями персонала.
            </p>
          </div>
        )}

        {/* Position quick view hints */}
        {currentView === 'positions' && (
          <div className="p-3 bg-[#161b22] border border-[#21262d] rounded-lg text-xs flex flex-col gap-2">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681] flex items-center gap-1.5">
              <Award className="w-3 h-3 text-[#38bdf8]" />
              <span>Штатная структура</span>
            </div>
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              Справочник квалификаций от Intern до Head по отделам разработки, продукта и инфраструктуры.
            </p>
          </div>
        )}
      </div>

      {/* Connection Status Footer */}
      <div className="p-3 border-t border-[#21262d] bg-[#161b22]/40">
        <div className="flex items-center justify-between text-[11px] text-[#6e7681]">
          <span>Подключение к БД</span>
          <span className="text-[#4ade80] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            Активно
          </span>
        </div>
      </div>
    </aside>
  );
};
