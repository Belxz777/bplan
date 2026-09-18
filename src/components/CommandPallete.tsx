import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckSquare,
  FolderKanban,
  Users,
  Briefcase,
  Plus,
  Download,
  Code2,
  Filter,
} from 'lucide-react';
import type { Task, Plan, User, Position, EntityView, TaskStatus } from '../..//types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  plans: Plan[];
  users?: User[];
  onSelectTask: (task: Task) => void;
  onSelectPlan: (plan: Plan) => void;
  onSelectUser?: (user: User) => void;
  onSelectPosition?: (position: Position) => void;
  onViewChange: (view: EntityView) => void;
  onOpenNewTask: () => void;
  onOpenNewPlan: () => void;
  onOpenNewUser?: () => void;
  onOpenNewPosition?: () => void;
  onOpenApiExplorer: () => void;
  onExportData: () => void;
  onFilterStatus: (status: TaskStatus) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  plans,
  users = [],
  onSelectTask,
  onSelectPlan,
  onSelectUser,
  onSelectPosition,
  onViewChange,
  onOpenNewTask,
  onOpenNewPlan,
  onOpenNewUser,
  onOpenNewPosition,
  onOpenApiExplorer,
  onExportData,
  onFilterStatus,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      String(t.id).includes(query) ||
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      String(p.id).includes(query) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(query.toLowerCase()))
  );



  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#21262d] gap-3">
          <Search className="w-4 h-4 text-[#6e7681]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск команды, задачи, сотрудника или должности..."
            className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder-[#6e7681] outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono bg-[#161b22] text-[#8b949e] px-1.5 py-0.5 rounded border border-[#30363d]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 text-xs">
          {/* Quick Navigation Sections */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
              Переход к разделам
            </div>
            <div className="grid grid-cols-2 gap-1 font-sans">
              <button
                onClick={() => {
                  onClose();
                  onViewChange('tasks');
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#161b22] flex items-center gap-2 text-[#f0f6fc] cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Задачи ({tasks.length})</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onViewChange('plans');
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#161b22] flex items-center gap-2 text-[#f0f6fc] cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Планы ({plans.length})</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onViewChange('users');
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#161b22] flex items-center gap-2 text-[#f0f6fc] cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Пользователи ({users.length})</span>
              </button>
            
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
              Быстрые действия
            </div>
            <div className="flex flex-col gap-0.5 font-sans">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewTask();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Создать задачу</span>
                </span>
                <span className="text-[11px] text-[#6e7681]"> Задача</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenNewPlan();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Создать план</span>
                </span>
                <span className="text-[11px] text-[#6e7681]"> План</span>
              </button>

              {onOpenNewUser && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewUser();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Создать пользователя</span>
                  </span>
                  <span className="text-[11px] text-[#6e7681]">Пользователь</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenApiExplorer();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-[#7bd0ff]" />
                  <span>REST API эндпоинты</span>
                </span>
                <span className="text-[11px] text-[#6e7681]">API</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onExportData();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>Экспорт данных (JSON)</span>
                </span>
                <span className="text-[11px] text-[#6e7681]">Экспорт</span>
              </button>
            </div>
          </div>

          {/* Quick Filters for Tasks */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
              Фильтр задач по статусу
            </div>
            <div className="grid grid-cols-2 gap-1 font-sans">
              {[
                { status: 'todo' as TaskStatus, label: 'В очереди' },
                { status: 'in_progress' as TaskStatus, label: 'В работе' },
                { status: 'done' as TaskStatus, label: 'Готово' },
                { status: 'cancelled' as TaskStatus, label: 'Отменено' },
              ].map(({ status, label }) => (
                <button
                  key={status}
                  onClick={() => {
                    onClose();
                    onViewChange('tasks');
                    onFilterStatus(status);
                  }}
                  className="text-left px-2.5 py-1.5 rounded hover:bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <Filter className="w-3 h-3 text-[#38bdf8]" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Matching Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
                Найденные задачи ({filteredTasks.length})
              </div>
              <div className="flex flex-col gap-0.5">
                {filteredTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onClose();
                      onSelectTask(task);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer font-sans"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] text-[#38bdf8]">#{task.id}</span>
                      <span className="truncate">{task.title}</span>
                    </span>
                    <span className="text-[10px] text-[#6e7681] shrink-0 ml-2">
                      {task.status === 'done'
                        ? 'Готово'
                        : task.status === 'in_progress'
                        ? 'В работе'
                        : task.status === 'cancelled'
                        ? 'Отменено'
                        : 'В очереди'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Users */}
          {filteredUsers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
                Найденные пользователи ({filteredUsers.length})
              </div>
              <div className="flex flex-col gap-0.5">
                {filteredUsers.slice(0, 4).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onClose();
                      onViewChange('users');
                      if (onSelectUser) onSelectUser(user);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#161b22] flex items-center justify-between text-[#f0f6fc] cursor-pointer font-sans"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span className="font-mono text-[11px] text-[#38bdf8]">@{user.username}</span>
                      <span className="truncate text-[#8b949e]">{user.full_name || user.email}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#6e7681] shrink-0 ml-2 uppercase">
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

      
        </div>
      </div>
    </div>
  );
};
