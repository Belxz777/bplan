import React, { useState } from 'react';
import { X, Send, Play, Terminal, Copy, Check, Clock, Database } from 'lucide-react';
import type { ApiEndpointDef } from '../../types';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseMutated?: () => void;
}

const AVAILABLE_ENDPOINTS: ApiEndpointDef[] = [
  {
    method: 'GET',
    path: '/api/users',
    description: 'Получить список пользователей',
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Аутентификация пользователя',
    defaultBody: JSON.stringify(
      {
        login: 'admin',
        password: 'admin12345',
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'Регистрация нового пользователя',
    defaultBody: JSON.stringify(
      {
        email: 'new_user@bplan.dev',
        username: 'new_developer',
        password: 'securePassword123',
        full_name: 'Дмитрий Соколов',
        position_id: 1,
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/positions',
    description: 'Получить список должностей',
  },
  {
    method: 'POST',
    path: '/api/positions',
    description: 'Создать новую должность',
    defaultBody: JSON.stringify(
      {
        title: 'Lead DevOps Engineer',
        description: 'Управление кластерами Kubernetes и CI/CD пайплайнами',
        department: 'infrastructure',
        level: 'lead',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/plans',
    description: 'Получить все планы с числом задач',
  },
  {
    method: 'POST',
    path: '/api/plans',
    description: 'Создать новый план',
    defaultBody: JSON.stringify(
      {
        name: 'Безопасность и архитектура Q3',
        description: 'Внедрение сервисной сетки и защиты данных.',
        status: 'active',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/plans/1',
    description: 'Получить план по ID',
  },
  {
    method: 'PUT',
    path: '/api/plans/1',
    description: 'Обновить план по ID',
    defaultBody: JSON.stringify(
      {
        name: 'Спринт 42 (Обновленный)',
        description: 'Оптимизация контрольных точек и очередей.',
        status: 'active',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/plans/1/tasks',
    description: 'Получить задачи плана #1',
  },
  {
    method: 'GET',
    path: '/api/tasks',
    description: 'Получить задачи (с фильтрацией)',
  },
  {
    method: 'POST',
    path: '/api/tasks',
    description: 'Добавить новую задачу',
    defaultBody: JSON.stringify(
      {
        plan_id: 1,
        title: 'Настройка резервного кластера',
        description: 'Проверка автоматического переключения за 30 сек.',
        status: 'todo',
        priority: 'high',
        due_date: '2025-06-01',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/tasks/1',
    description: 'Получить задачу по ID',
  },
  {
    method: 'PUT',
    path: '/api/tasks/1',
    description: 'Обновить атрибуты задачи',
    defaultBody: JSON.stringify(
      {
        status: 'done',
        priority: 'critical',
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/tasks/batch-status',
    description: 'Массовое обновление статуса задач',
    defaultBody: JSON.stringify(
      {
        ids: [1, 4, 5],
        status: 'done',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/db/info',
    description: 'Статистика базы данных',
  },
  {
    method: 'POST',
    path: '/api/db/query',
    description: 'Выполнить SQL-запрос',
    defaultBody: JSON.stringify(
      {
        query: 'SELECT tasks.id, tasks.title, plans.name FROM tasks JOIN plans ON plans.id = tasks.plan_id WHERE tasks.priority = "critical"',
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/db/reset',
    description: 'Сбросить базу к исходным данным',
    defaultBody: '{}',
  },
];

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({
  isOpen,
  onClose,
  onDatabaseMutated,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDef>(AVAILABLE_ENDPOINTS[0]);
  const [customPath, setCustomPath] = useState(AVAILABLE_ENDPOINTS[0].path);
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [requestBody, setRequestBody] = useState(AVAILABLE_ENDPOINTS[0].defaultBody || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string>('Нажмите "Отправить" для выполнения запроса.');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectEndpoint = (ep: ApiEndpointDef) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setCustomMethod(ep.method);
    setRequestBody(ep.defaultBody || '');
    setResponseStatus(null);
    setResponseTimeMs(null);
    setResponseData('// Готово к отправке запроса');
  };

  const handleSend = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const options: RequestInit = {
        method: customMethod,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if ((customMethod === 'POST' || customMethod === 'PUT') && requestBody.trim()) {
        options.body = requestBody.trim();
      }

      const res = await fetch(customPath, options);
      const latency = Math.round(performance.now() - start);
      setResponseTimeMs(latency);
      setResponseStatus(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setResponseData(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponseData(text);
      }

      if (customMethod !== 'GET' && onDatabaseMutated) {
        onDatabaseMutated();
      }
    } catch (err) {
      setResponseStatus(500);
      setResponseData(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseData);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m) {
      case 'GET':
        return 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/30';
      case 'POST':
        return 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30';
      case 'PUT':
        return 'text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/30';
      case 'DELETE':
        return 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/30';
      default:
        return 'text-[#f0f6fc] bg-[#262a31] border-[#30363d]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="h-12 px-4 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm text-[#f0f6fc]">
                Интерактивный просмотр REST API
              </span>
              <span className="text-[11px] text-[#6e7681] ml-2">
                Эндпоинты базы данных
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-[#1c2026] flex items-center justify-center text-[#6e7681] hover:text-[#f0f6fc] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body: Endpoints List on Left, Console on Right */}
        <div className="flex-1 flex min-h-0 divide-x divide-[#21262d]">
          {/* Left Column: Endpoints Catalog */}
          <div className="w-72 shrink-0 bg-[#0b0f19] flex flex-col overflow-y-auto p-2">
            <div className="px-2 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6e7681]">
              Доступные эндпоинты ({AVAILABLE_ENDPOINTS.length})
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono">
              {AVAILABLE_ENDPOINTS.map((ep, idx) => {
                const isSelected =
                  selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-2 rounded flex flex-col gap-1 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#161b22] border-l-2 border-[#38bdf8]'
                        : 'hover:bg-[#161b22]/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1 py-0.2 text-[10px] font-bold rounded border ${getMethodBadgeClass(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-[#f0f6fc] text-[11px] truncate">{ep.path}</span>
                    </div>
                    <span className="text-[10px] text-[#6e7681] font-sans truncate">
                      {ep.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Request Composer & Live Response Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117] p-4 gap-4 overflow-y-auto">
            {/* Request Bar */}
            <div className="flex items-center gap-2">
              <select
                value={customMethod}
                onChange={(e) =>
                  setCustomMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')
                }
                className={`h-9 px-2.5 rounded font-mono font-bold text-xs border cursor-pointer outline-none ${getMethodBadgeClass(
                  customMethod
                )}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="w-full h-9 px-3 bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded font-mono text-xs text-[#f0f6fc] outline-none"
                  placeholder="/api/tasks"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={loading}
                className="h-9 px-3.5 rounded bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-[#0b0f19] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Отправить</span>
              </button>
            </div>

            {/* Request Body Editor (if POST or PUT) */}
            {(customMethod === 'POST' || customMethod === 'PUT') && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-[#8b949e]">Тело запроса (JSON)</label>
                <textarea
                  rows={5}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0f19] border border-[#21262d] focus:border-[#38bdf8] rounded font-mono text-xs text-[#38bdf8] outline-none resize-y"
                  placeholder="{}"
                />
              </div>
            )}

            {/* Response Section */}
            <div className="flex-1 flex flex-col min-h-[220px] bg-[#0b0f19] border border-[#21262d] rounded-lg overflow-hidden">
              <div className="h-8 px-3 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#8b949e]">Ответ</span>
                  {responseStatus !== null && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        responseStatus < 300
                          ? 'bg-[#4ade80]/20 text-[#4ade80]'
                          : 'bg-[#f87171]/20 text-[#f87171]'
                      }`}
                    >
                      {responseStatus}
                    </span>
                  )}
                  {responseTimeMs !== null && (
                    <span className="text-[#6e7681] text-[10px]">{responseTimeMs}ms</span>
                  )}
                </div>

                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 text-[11px] text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3 text-[#8b949e]" />}
                  <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>

              <div className="flex-1 p-3 overflow-auto">
                <pre className="font-mono text-xs text-[#dfe2eb] whitespace-pre-wrap leading-relaxed">
                  {responseData}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
