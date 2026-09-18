import React, { useState } from 'react';
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
  X,
  PanelLeftOpen,
  PanelLeftClose
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
  toogle: () => void;
  isOpened: boolean;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onClearFilters: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  stats,
  isOpened,
  toogle,
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



  return (
        <div className="relative shrink-0 h-full">
<div
  className={`
    relative shrink-0 h-full
    transition-[width]
    duration-200
    overflow-hidden
    ease-in-out
    ${isOpened  ? 'w-56' : 'w-0'}
  `}
>
  <aside
    className="
      absolute
      inset-y-0
      left-0
      w-56
      bg-[#0d1117]
      border-r
      border-[#21262d]
      flex
      flex-col
      justify-between
      overflow-hidden
      select-none
    "
  >
   <div className="w-56 h-full p-3 flex flex-col gap-5">
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

      
      </div>

      {/* Connection Status Footer */}
<div className="w-56 p-3 border-t border-[#21262d] bg-[#161b22]/40">        <div className="flex items-center justify-between text-[11px] text-[#6e7681]">
          <span>Подключение к БД</span>
          <span className="text-[#4ade80] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            Активно
          </span>
        </div>
      </div>
    </aside>
    </div>
      <button
    type="button"
    onClick={toogle}
    className="
      absolute
      top-3
      left-[calc(100%-12px)]
      z-30
      w-6
      h-6
      rounded-md
      flex
      items-center
      justify-center
      bg-[#161b22]
      border
      border-[#30363d]
      text-[#8b949e]
      hover:text-[#f0f6fc]
      hover:bg-[#21262d]
      transition-colors
      cursor-pointer
    "
    title={isOpened ? 'Скрыть боковую панель' : 'Показать боковую панель'}
  >
    {isOpened ? (
      <PanelLeftClose className="w-3.5 h-3.5" />
    ) : (
      <PanelLeftOpen className="w-3.5 h-3.5" />
    )}
  </button>
    </div>
    
  );
};
