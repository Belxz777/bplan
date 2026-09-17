import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Save,
  Edit3,
  PlusCircle,
  FolderPlus,
  FolderKanban,
  ChevronDown,
} from 'lucide-react';
import  type { Task, Plan, DrawerMode, TaskStatus, TaskPriority, PlanStatus } from '../../types/index';

interface CrudDrawerProps {
  mode: DrawerMode;
  initialTask?: Task | null;
  initialPlan?: Plan | null;
  plans: Plan[];
  onClose: () => void;
  onSaveTask: (taskData: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  onSavePlan: (planData: Partial<Plan>) => Promise<void>;
  onDeletePlan: (id: number) => Promise<void>;
}

export const CrudDrawer: React.FC<CrudDrawerProps> = ({
  mode,
  initialTask,
  initialPlan,
  plans,
  onClose,
  onSaveTask,
  onDeleteTask,
  onSavePlan,
  onDeletePlan,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [planId, setPlanId] = useState<number>(1);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [planStatus, setPlanStatus] = useState<PlanStatus>('active');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (mode === 'edit-task' && initialTask) {
      setTitle(initialTask.title);
      setPlanId(initialTask.plan_id);
      setTaskStatus(initialTask.status);
      setPriority(initialTask.priority);
      setDueDate(initialTask.due_date || '');
      setDescription(initialTask.description || '');
    } else if (mode === 'new-task') {
      setTitle('');
      setPlanId(plans[0]?.id || 1);
      setTaskStatus('todo');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    } else if (mode === 'edit-plan' && initialPlan) {
      setTitle(initialPlan.name);
      setPlanStatus(initialPlan.status);
      setDescription(initialPlan.description || '');
    } else if (mode === 'new-plan') {
      setTitle('');
      setPlanStatus('active');
      setDescription('');
    }
  }, [mode, initialTask, initialPlan, plans]);

  if (mode === 'none') return null;

  const isTask = mode === 'new-task' || mode === 'edit-task';
  const isEdit = mode === 'edit-task' || mode === 'edit-plan';

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Пожалуйста, введите название.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isTask) {
        await onSaveTask({
          ...(isEdit && initialTask ? { id: initialTask.id } : {}),
          title: title.trim(),
          plan_id: Number(planId),
          status: taskStatus,
          priority,
          due_date: dueDate.trim() || null,
          description: description.trim() || null,
        });
      } else {
        await onSavePlan({
          ...(isEdit && initialPlan ? { id: initialPlan.id } : {}),
          name: title.trim(),
          status: planStatus,
          description: description.trim() || null,
        });
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isTask && initialTask) {
      if (confirm(`Удалить задачу #${initialTask.id}?`)) {
        await onDeleteTask(initialTask.id);
        onClose();
      }
    } else if (!isTask && initialPlan) {
      if (confirm(`Удалить план #${initialPlan.id} и связанные с ним задачи?`)) {
        await onDeletePlan(initialPlan.id);
        onClose();
      }
    }
  };

  // Compute header information
  let headerTitle = 'Редактировать задачу';
  let headerBadge = 'ID: 1';
  let headerSubtitle = 'Изменение параметров задачи';
  let HeaderIcon = Edit3;

  if (mode === 'new-task') {
    headerTitle = 'Новая задача';
    headerBadge = 'новая';
    headerSubtitle = 'Создание новой задачи';
    HeaderIcon = PlusCircle;
  } else if (mode === 'edit-task' && initialTask) {
    headerTitle = 'Редактировать задачу';
    headerBadge = `ID: ${initialTask.id}`;
    headerSubtitle = 'Изменение параметров задачи';
    HeaderIcon = Edit3;
  } else if (mode === 'new-plan') {
    headerTitle = 'Новый план';
    headerBadge = 'новый';
    headerSubtitle = 'Создание проекта или плана';
    HeaderIcon = FolderPlus;
  } else if (mode === 'edit-plan' && initialPlan) {
    headerTitle = 'Редактировать план';
    headerBadge = `ID: ${initialPlan.id}`;
    headerSubtitle = 'Изменение параметров плана';
    HeaderIcon = FolderKanban;
  }

  return (
    <aside className="w-[420px] max-w-full shrink-0 bg-[#0d1117] border-l border-[#21262d] flex flex-col justify-between shadow-2xl z-20 animate-in slide-in-from-right duration-150 select-none">
      {/* Drawer Header */}
      <div className="p-4 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
            <HeaderIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#f0f6fc]">{headerTitle}</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#262a31] text-[#38bdf8]">
                {headerBadge}
              </span>
            </div>
            <p className="text-[11px] text-[#6e7681]">{headerSubtitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded hover:bg-[#1c2026] flex items-center justify-center text-[#6e7681] hover:text-[#f0f6fc] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Form Body */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4 text-xs">
        {error && (
          <div className="p-2.5 rounded bg-[#7f1d1d]/30 border border-[#f87171]/40 text-[#f87171] text-[11px]">
            {error}
          </div>
        )}

        {/* Title Field (required) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[#8b949e] font-medium flex items-center justify-between">
            <span>
              {isTask ? 'Название задачи' : 'Название плана'} <span className="text-[#f87171]">*</span>
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-8 px-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] placeholder-[#6e7681] outline-none transition-all"
            placeholder={isTask ? 'Введите название задачи...' : 'Введите название плана...'}
          />
        </div>

        {/* Plan Selector - only for tasks */}
        {isTask && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[#8b949e] font-medium">План / Проект</label>
            <div className="relative">
              <select
                value={planId}
                onChange={(e) => setPlanId(Number(e.target.value))}
                className="w-full h-8 px-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] outline-none appearance-none cursor-pointer"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#6e7681] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Status & Priority Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Status Column */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#8b949e] font-medium">Статус</label>
            <div className="relative">
              {isTask ? (
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                  className="w-full h-8 px-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] outline-none appearance-none cursor-pointer"
                >
                  <option value="todo">В очереди</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Готово</option>
                  <option value="cancelled">Отменено</option>
                </select>
              ) : (
                <select
                  value={planStatus}
                  onChange={(e) => setPlanStatus(e.target.value as PlanStatus)}
                  className="w-full h-8 px-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] outline-none appearance-none cursor-pointer"
                >
                  <option value="active">Активен</option>
                  <option value="completed">Завершен</option>
                  <option value="archived">В архиве</option>
                </select>
              )}
              <ChevronDown className="w-4 h-4 text-[#6e7681] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Priority Column - only for tasks */}
          {isTask && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[#8b949e] font-medium">Приоритет</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-8 px-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] outline-none appearance-none cursor-pointer"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критический</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#6e7681] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Due Date Field - only for tasks */}
        {isTask && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[#8b949e] font-medium">Срок выполнения</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] outline-none cursor-pointer"
            />
          </div>
        )}

        {/* Description Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[#8b949e] font-medium">Описание</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Дополнительные подробности..."
            className="w-full p-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded text-[#f0f6fc] placeholder-[#6e7681] outline-none text-xs resize-none"
          />
        </div>

        {/* Clean metadata info if editing */}
        {isEdit && (
          <div className="mt-2 p-3 rounded border border-[#21262d] bg-[#181c22] text-[11px] text-[#6e7681] flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span>Создано:</span>
              <span className="text-[#8b949e] font-mono">
                {(isTask ? initialTask?.created_at : initialPlan?.created_at) || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Обновлено:</span>
              <span className="text-[#8b949e] font-mono">
                {(isTask ? initialTask?.updated_at : initialPlan?.updated_at) || '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Action Buttons */}
      <div className="p-3.5 bg-[#161b22] border-t border-[#21262d] flex items-center justify-between gap-2">
        {isEdit ? (
          <button
            onClick={handleDelete}
            className="h-8 px-3 rounded bg-[#7f1d1d]/20 hover:bg-[#7f1d1d] border border-[#f87171]/30 text-[#f87171] hover:text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Удалить запись"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Удалить</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="h-8 px-3.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-4 rounded bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-[#0b0f19] font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
