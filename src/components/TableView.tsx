import React, { useState } from 'react';
import {
  Folder,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  X,
  CheckCircle2,
  FolderKanban,
  Check,
} from 'lucide-react';
import type { Task, Plan, EntityView, ActiveFilters, TaskStatus, TaskPriority } from '../../types';

interface TableViewProps {
  currentView: EntityView;
  tasks: Task[];
  plans: Plan[];
  loading: boolean;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onRefresh: () => void;
  onAddRecord: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (id: number) => void;
  onBatchStatusChange: (status: TaskStatus) => void;
  onBatchPlanChange: (planId: number) => void;
  onBatchDelete: () => void;
  selectedTaskIds: number[];
  onToggleSelectTask: (id: number) => void;
  onToggleSelectAllTasks: () => void;
  queryLatencyMs: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSortChange: (column: string) => void;
  onSelectPlanForTasks: (planId: number) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  currentView,
  tasks,
  plans,
  loading,
  activeFilters,
  onFilterChange,
  onRefresh,
  onAddRecord,
  onEditTask,
  onDeleteTask,
  onEditPlan,
  onDeletePlan,
  onBatchStatusChange,
  onBatchPlanChange,
  onBatchDelete,
  selectedTaskIds,
  onToggleSelectTask,
  onToggleSelectAllTasks,
  queryLatencyMs,
  sortBy,
  sortOrder,
  onSortChange,
  onSelectPlanForTasks,
}) => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [batchStatusMenuOpen, setBatchStatusMenuOpen] = useState(false);
  const [batchPlanMenuOpen, setBatchPlanMenuOpen] = useState(false);
  const [perPage, setPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination calculations
  const items = currentView === 'tasks' ? tasks : plans;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const currentItems = items.slice(startIndex, startIndex + perPage);

  const isAllSelected =
    currentView === 'tasks' &&
    tasks.length > 0 &&
    tasks.every((t) => selectedTaskIds.includes(t.id));

  const hasActiveFilters =
    Boolean(activeFilters.status) ||
    Boolean(activeFilters.priority) ||
    Boolean(activeFilters.plan_id) ||
    Boolean(activeFilters.planLifecycle);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#f87171] font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Критический</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#fb923c]">
            <SignalHigh className="w-3.5 h-3.5" />
            <span>Высокий</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#fbbf24]">
            <SignalMedium className="w-3.5 h-3.5" />
            <span>Средний</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6e7681]">
            <SignalLow className="w-3.5 h-3.5" />
            <span>Низкий</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
            <span>В работе</span>
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            <span>Готово</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
            <span>Отменено</span>
          </span>
        );
      case 'todo':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#1c2026] text-[#8b949e] border border-[#21262d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6e7681]" />
            <span>В очереди</span>
          </span>
        );
    }
  };

  const getSortLabel = (col: string) => {
    switch (col) {
      case 'id':
        return 'ID';
      case 'title':
        return 'Названию';
      case 'plan_id':
        return 'Плану';
      case 'status':
        return 'Статусу';
      case 'priority':
        return 'Приоритету';
      case 'due_date':
        return 'Сроку';
      case 'name':
        return 'Плану';
      case 'created_at':
        return 'Дате';
      default:
        return col;
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#0b0f19] overflow-hidden select-none">
      {/* Table Header & Quick Operations Bar (Clean, no technical clutter) */}
      <div className="p-3.5 border-b border-[#21262d] bg-[#0d1117]/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <h1 className="text-sm font-semibold text-[#f0f6fc]">
              {currentView === 'tasks' ? 'Задачи' : 'Планы'}
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1c2026] text-[#8b949e]">
              Всего: {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded bg-[#0d1117] hover:bg-[#1c2026] text-[#8b949e] hover:text-[#f0f6fc] border border-[#21262d] transition-colors cursor-pointer"
              title="Обновить"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38bdf8]' : ''}`} />
            </button>

            <button
              onClick={onAddRecord}
              className="h-7 px-2.5 rounded bg-[#0284c7]/20 hover:bg-[#0284c7] border border-[#38bdf8]/40 text-[#38bdf8] hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span> Добавить</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-[#6e7681]">
                filter_list
              </span>
              <input
                value={activeFilters.search || ''}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="w-full h-7.5 pl-8 pr-3 bg-[#181c22] border border-[#21262d] rounded text-xs text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#38bdf8]/50 outline-none"
                placeholder="Поиск по названию или описанию..."
              />
            </div>

            {/* Active Filter Chips */}
            {activeFilters.status && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1c2026] border border-[#21262d] rounded text-[11px] text-[#8b949e]">
                <span className="text-[#6e7681]">статус:</span>
                <span className="text-[#38bdf8] font-medium">
                  {activeFilters.status === 'todo'
                    ? 'В очереди'
                    : activeFilters.status === 'in_progress'
                    ? 'В работе'
                    : activeFilters.status === 'done'
                    ? 'Готово'
                    : 'Отменено'}
                </span>
                <button
                  onClick={() => onFilterChange({ status: undefined })}
                  className="hover:text-[#f87171] text-[#6e7681] ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {activeFilters.priority && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1c2026] border border-[#21262d] rounded text-[11px] text-[#8b949e]">
                <span className="text-[#6e7681]">приоритет:</span>
                <span className="text-[#fb923c] font-medium">
                  {activeFilters.priority === 'critical'
                    ? 'Критический'
                    : activeFilters.priority === 'high'
                    ? 'Высокий'
                    : activeFilters.priority === 'medium'
                    ? 'Средний'
                    : 'Низкий'}
                </span>
                <button
                  onClick={() => onFilterChange({ priority: undefined })}
                  className="hover:text-[#f87171] text-[#6e7681] ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {activeFilters.plan_id && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1c2026] border border-[#21262d] rounded text-[11px] text-[#8b949e]">
                <span className="text-[#6e7681]">план:</span>
                <span className="text-[#38bdf8] font-medium">#{activeFilters.plan_id}</span>
                <button
                  onClick={() => onFilterChange({ plan_id: undefined })}
                  className="hover:text-[#f87171] text-[#6e7681] ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {activeFilters.planLifecycle && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1c2026] border border-[#21262d] rounded text-[11px] text-[#8b949e]">
                <span className="text-[#6e7681]">статус:</span>
                <span className="text-[#4ade80] font-medium">
                  {activeFilters.planLifecycle === 'active'
                    ? 'Активен'
                    : activeFilters.planLifecycle === 'completed'
                    ? 'Завершен'
                    : 'В архиве'}
                </span>
                <button
                  onClick={() => onFilterChange({ planLifecycle: undefined })}
                  className="hover:text-[#f87171] text-[#6e7681] ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={() =>
                  onFilterChange({
                    status: undefined,
                    priority: undefined,
                    plan_id: undefined,
                    planLifecycle: undefined,
                    search: undefined,
                  })
                }
                className="text-[11px] text-[#6e7681] hover:text-[#f0f6fc] underline cursor-pointer"
              >
                Сбросить
              </button>
            )}

            {/* Add Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="h-7 px-2 rounded bg-[#1c2026] hover:bg-[#262a31] border border-[#21262d] text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Фильтр</span>
              </button>

              {filterDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-[#1f242c] border border-[#30363d] rounded-md shadow-xl py-1 z-20 text-xs">
                  <div className="px-2 py-1 text-[10px] text-[#6e7681] uppercase tracking-wider font-semibold">
                    По статусу
                  </div>
                  {([
                    { val: 'todo', label: 'В очереди' },
                    { val: 'in_progress', label: 'В работе' },
                    { val: 'done', label: 'Готово' },
                    { val: 'cancelled', label: 'Отменено' },
                  ] as { val: TaskStatus; label: string }[]).map((st) => (
                    <button
                      key={st.val}
                      onClick={() => {
                        onFilterChange({ status: st.val });
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#262a31] text-[#f0f6fc] flex items-center justify-between"
                    >
                      <span>{st.label}</span>
                      {activeFilters.status === st.val && <Check className="w-3 h-3 text-[#38bdf8]" />}
                    </button>
                  ))}
                  <div className="border-t border-[#30363d] my-1" />
                  <div className="px-2 py-1 text-[10px] text-[#6e7681] uppercase tracking-wider font-semibold">
                    По приоритету
                  </div>
                  {([
                    { val: 'critical', label: 'Критический' },
                    { val: 'high', label: 'Высокий' },
                    { val: 'medium', label: 'Средний' },
                    { val: 'low', label: 'Низкий' },
                  ] as { val: TaskPriority; label: string }[]).map((pr) => (
                    <button
                      key={pr.val}
                      onClick={() => {
                        onFilterChange({ priority: pr.val });
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#262a31] text-[#f0f6fc] flex items-center justify-between"
                    >
                      <span>{pr.label}</span>
                      {activeFilters.priority === pr.val && <Check className="w-3 h-3 text-[#38bdf8]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sort Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[#6e7681]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6e7681]" />
            <span>
              Сортировка по{' '}
              <button
                onClick={() => onSortChange(sortBy)}
                className="text-[#f0f6fc] font-medium hover:underline cursor-pointer"
              >
                {getSortLabel(sortBy)} ({sortOrder === 'ASC' ? 'по возр.' : 'по убыв.'})
              </button>
            </span>
          </div>
        </div>

        {/* Batch Action Bar (Displayed when rows are checked) */}
        {selectedTaskIds.length > 0 && currentView === 'tasks' && (
          <div className="flex items-center justify-between bg-[#262a31] border border-[#38bdf8]/30 px-3 py-1.5 rounded-md text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-[#38bdf8] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                <span>Выбрано: {selectedTaskIds.length}</span>
              </div>
              <div className="h-3 w-px bg-[#30363d]" />
              <div className="flex items-center gap-1 relative">
                {/* Change Status Popover */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setBatchStatusMenuOpen(!batchStatusMenuOpen);
                      setBatchPlanMenuOpen(false);
                    }}
                    className="h-6 px-2 rounded bg-[#0d1117] hover:bg-[#1c2026] border border-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Статус</span>
                  </button>

                  {batchStatusMenuOpen && (
                    <div className="absolute left-0 mt-1 w-36 bg-[#1f242c] border border-[#30363d] rounded shadow-xl py-1 z-30 text-xs">
                      {([
                        { val: 'todo', label: 'В очереди' },
                        { val: 'in_progress', label: 'В работе' },
                        { val: 'done', label: 'Готово' },
                        { val: 'cancelled', label: 'Отменено' },
                      ] as { val: TaskStatus; label: string }[]).map((st) => (
                        <button
                          key={st.val}
                          onClick={() => {
                            onBatchStatusChange(st.val);
                            setBatchStatusMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1 hover:bg-[#262a31] text-[#f0f6fc]"
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Change Plan Popover */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setBatchPlanMenuOpen(!batchPlanMenuOpen);
                      setBatchStatusMenuOpen(false);
                    }}
                    className="h-6 px-2 rounded bg-[#0d1117] hover:bg-[#1c2026] border border-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
                  >
                    <Folder className="w-3 h-3" />
                    <span>План</span>
                  </button>

                  {batchPlanMenuOpen && (
                    <div className="absolute left-0 mt-1 w-48 bg-[#1f242c] border border-[#30363d] rounded shadow-xl py-1 z-30 text-xs">
                      {plans.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onBatchPlanChange(p.id);
                            setBatchPlanMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1 hover:bg-[#262a31] text-[#f0f6fc] truncate"
                        >
                          {p.id} · {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onBatchDelete}
                className="h-6 px-2.5 rounded bg-[#7f1d1d]/30 hover:bg-[#7f1d1d] border border-[#f87171]/40 text-[#f87171] hover:text-white font-medium flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Удалить</span>
              </button>
              <button
                onClick={onToggleSelectAllTasks}
                className="w-6 h-6 rounded flex items-center justify-center text-[#6e7681] hover:text-[#f0f6fc] transition-colors cursor-pointer"
                title="Снять выбор"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="flex-1 overflow-auto">
        {currentView === 'tasks' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#161b22] border-b border-[#21262d] text-[#6e7681] text-[11px] tracking-wider z-10 select-none">
              <tr>
                <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAllTasks}
                    className="w-3.5 h-3.5 rounded bg-[#0b0f19] border-[#30363d] accent-[#0284c7] cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => onSortChange('id')}
                  className="px-3 py-2.5 w-16 cursor-pointer hover:text-[#f0f6fc]"
                >
                  <div className="flex items-center gap-1 font-mono">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => onSortChange('title')}
                  className="px-3 py-2.5 min-w-[280px] cursor-pointer hover:text-[#f0f6fc]"
                >
                  <div className="flex items-center gap-1">
                    <span>Название</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => onSortChange('plan_id')}
                  className="px-3 py-2.5 w-44 cursor-pointer hover:text-[#f0f6fc]"
                >
                  <div className="flex items-center gap-1">
                    <span>План</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => onSortChange('status')}
                  className="px-3 py-2.5 w-32 cursor-pointer hover:text-[#f0f6fc]"
                >
                  <div className="flex items-center gap-1">
                    <span>Статус</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => onSortChange('priority')}
                  className="px-3 py-2.5 w-28 cursor-pointer hover:text-[#f0f6fc]"
                >
                  <div className="flex items-center gap-1">
                    <span>Приоритет</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => onSortChange('due_date')}
                  className="px-3 py-2.5 w-28 cursor-pointer hover:text-[#f0f6fc]"
                >
                  <div className="flex items-center gap-1">
                    <span>Срок</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-2.5 w-24 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#f0f6fc] font-sans">
              {(currentItems as Task[]).map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <tr
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#181c22]/70 hover:bg-[#161b22]'
                        : 'hover:bg-[#161b22]'
                    }`}
                  >
                    <td
                      className="px-3 py-2.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectTask(task.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectTask(task.id)}
                        className="w-3.5 h-3.5 rounded bg-[#0b0f19] border-[#30363d] accent-[#0284c7] cursor-pointer"
                      />
                    </td>
                    <td
                      className={`px-3 py-2.5 font-mono ${
                        isSelected ? 'text-[#38bdf8] font-semibold' : 'text-[#6e7681]'
                      }`}
                    >
                      {task.id}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-[#f0f6fc]">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#1c2026] border border-[#21262d] text-[#38bdf8]">
                        <Folder className="w-3 h-3 text-[#38bdf8]" />
                        <span className="truncate max-w-[150px]">
                          {task.plan_name || `План ${task.plan_id}`}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{getStatusBadge(task.status)}</td>
                    <td className="px-3 py-2.5">{getPriorityBadge(task.priority)}</td>
                    <td className="px-3 py-2.5 font-mono text-[#8b949e] text-[11px]">
                      {task.due_date || '—'}
                    </td>
                    <td
                      className="px-3 py-2.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded hover:bg-[#1c2026] text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 rounded hover:bg-[#1c2026] text-[#f87171] hover:text-red-400 cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#6e7681]">
                    Задачи не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* Plans Table */
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#161b22] border-b border-[#21262d] text-[#6e7681] text-[11px] tracking-wider z-10 select-none">
              <tr>
                <th className="px-3 py-2.5 w-16 font-mono">ID</th>
                <th className="px-3 py-2.5 min-w-[240px]">Название плана</th>
                <th className="px-3 py-2.5 min-w-[280px]">Описание</th>
                <th className="px-3 py-2.5 w-32">Статус</th>
                <th className="px-3 py-2.5 w-32">Задачи</th>
                <th className="px-3 py-2.5 w-40">Создан</th>
                <th className="px-3 py-2.5 w-24 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#f0f6fc] font-sans">
              {(currentItems as Plan[]).map((plan) => (
                <tr
                  key={plan.id}
                  onClick={() => onEditPlan(plan)}
                  className="group hover:bg-[#161b22] transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2.5 font-mono text-[#38bdf8] font-semibold">
                    {plan.id}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-[#f0f6fc]">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-[#38bdf8]" />
                      <span>{plan.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#8b949e] text-[11px]">
                    <span className="line-clamp-1">{plan.description || '—'}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] ${
                        plan.status === 'active'
                          ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20'
                          : plan.status === 'completed'
                          ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                          : 'bg-[#1c2026] text-[#6e7681] border border-[#21262d]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          plan.status === 'active'
                            ? 'bg-[#4ade80]'
                            : plan.status === 'completed'
                            ? 'bg-[#38bdf8]'
                            : 'bg-[#6e7681]'
                        }`}
                      />
                      <span>
                        {plan.status === 'active'
                          ? 'Активен'
                          : plan.status === 'completed'
                          ? 'Завершен'
                          : 'В архиве'}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectPlanForTasks(plan.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#1c2026] hover:bg-[#262a31] text-[#38bdf8] border border-[#21262d] cursor-pointer"
                      title="Показать задачи этого плана"
                    >
                      <Folder className="w-3 h-3 text-[#38bdf8]" />
                      <span>{plan.tasks_count ?? 0} задач</span>
                    </button>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[#6e7681] text-[11px]">
                    {plan.created_at}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditPlan(plan)}
                        className="p-1 rounded hover:bg-[#1c2026] text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer"
                        title="Редактировать"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="p-1 rounded hover:bg-[#1c2026] text-[#f87171] hover:text-red-400 cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#6e7681]">
                    Планы не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Status Bar (Clean, no query string clutter) */}
      <footer className="h-10 px-4 border-t border-[#21262d] bg-[#0d1117] flex items-center justify-between text-xs text-[#6e7681] shrink-0">
        <div className="flex items-center gap-2">
          <span>
            Показано{' '}
            <strong className="text-[#f0f6fc] font-mono">
              {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + perPage, totalItems)}
            </strong>{' '}
            из <strong className="text-[#f0f6fc] font-mono">{totalItems}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Строк:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#161b22] border border-[#21262d] text-[#f0f6fc] rounded px-2 py-0.5 text-xs font-mono outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-[#161b22] border border-[#21262d] text-[#6e7681] disabled:opacity-40 hover:text-[#f0f6fc] cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 rounded bg-[#1c2026] font-mono text-[11px] text-[#f0f6fc]">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded bg-[#161b22] border border-[#21262d] text-[#8b949e] disabled:opacity-40 hover:text-[#f0f6fc] cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};
