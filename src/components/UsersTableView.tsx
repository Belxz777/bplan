import React, { useState } from 'react';
import type { User, UserRole, UserStatus, Position } from '../..//types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';

interface UsersTableViewProps {
  users: User[];
  positions: Position[];
  loading: boolean;
  onOpenNewUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: number) => void;
}

export const UsersTableView: React.FC<UsersTableViewProps> = ({
  users,
  positions,
  loading,
  onOpenNewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchName = (u.full_name || '').toLowerCase().includes(q);
      const matchPos = (u.position_title || '').toLowerCase().includes(q);
      if (!matchEmail && !matchUsername && !matchName && !matchPos) return false;
    }
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/30">
            <Shield className="w-3 h-3" />
            <span>Администратор</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30">
            <Briefcase className="w-3 h-3" />
            <span>Менеджер</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#38bdf8]/15 text-[#7dd3fc] border border-[#38bdf8]/30">
            <span>Сотрудник</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Активен</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#6e7681]/15 text-[#8b949e] border border-[#6e7681]/30">
            <Clock className="w-3 h-3" />
            <span>Неактивен</span>
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f85149]/15 text-[#f85149] border border-[#f85149]/30">
            <XCircle className="w-3 h-3" />
            <span>Заблокирован</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19] overflow-hidden">
      {/* Top Filter & Action Bar */}
      <div className="px-5 py-3 border-b border-[#21262d] bg-[#161b22]/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px] max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО, логину, email или должности..."
              className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-1.5 pl-8 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#6e7681] absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center bg-[#0b0f19] border border-[#30363d] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                roleFilter === 'all'
                  ? 'bg-[#21262d] text-[#f0f6fc]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Все роли
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-[#21262d] text-[#c084fc]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Администраторы
            </button>
            <button
              onClick={() => setRoleFilter('manager')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                roleFilter === 'manager'
                  ? 'bg-[#21262d] text-[#fbbf24]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Менеджеры
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                roleFilter === 'user'
                  ? 'bg-[#21262d] text-[#7dd3fc]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Сотрудники
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] text-[#f0f6fc] text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="banned">Заблокированные</option>
          </select>

          {/* Add User Button */}
          <button
            onClick={onOpenNewUser}
            className="px-3 py-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0b0f19] font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Пользователь</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#161b22] text-[#8b949e] uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#21262d] z-10 font-mono">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={
                    filteredUsers.length > 0 &&
                    selectedIds.length === filteredUsers.length
                  }
                  onChange={handleToggleSelectAll}
                  className="rounded border-[#30363d] bg-[#0b0f19] accent-[#38bdf8] cursor-pointer"
                />
              </th>
              <th className="px-4 py-2.5 w-14">ID</th>
              <th className="px-4 py-2.5">Пользователь</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Должность / Отдел</th>
              <th className="px-4 py-2.5">Роль</th>
              <th className="px-4 py-2.5">Статус</th>
              <th className="px-4 py-2.5">Последний вход</th>
              <th className="px-4 py-2.5 text-right w-24">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d] font-sans">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-[#8b949e]">
                  Загрузка списка пользователей...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-[#8b949e]">
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-[#161b22]/60 transition-colors ${
                      isSelected ? 'bg-[#38bdf8]/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(user.id)}
                        className="rounded border-[#30363d] bg-[#0b0f19] accent-[#38bdf8] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-[#6e7681]">
                      #{user.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-[#30363d] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs font-semibold text-[#f0f6fc] shrink-0">
                            {(user.full_name || user.username)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-[#f0f6fc] truncate">
                            {user.full_name || user.username}
                          </div>
                          <div className="text-[11px] text-[#8b949e] font-mono truncate">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#c9d1d9] text-[11px]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {user.position_title ? (
                        <div>
                          <div className="text-[#f0f6fc] font-medium truncate">
                            {user.position_title}
                          </div>
                          <div className="text-[10px] text-[#8b949e] font-mono uppercase">
                            {user.position_department || 'general'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#6e7681] italic">Не назначена</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#8b949e]">
                      {user.last_login_at ? (
                        new Date(user.last_login_at).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      ) : (
                        <span className="text-[#6e7681]">Никогда</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditUser(user)}
                          title="Редактировать"
                          className="p-1 text-[#8b949e] hover:text-[#38bdf8] hover:bg-[#21262d] rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          title="Удалить"
                          className="p-1 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Bar */}
      <div className="px-5 py-2.5 border-t border-[#21262d] bg-[#161b22] flex items-center justify-between text-[11px] text-[#8b949e] shrink-0 font-mono">
        <div>
          Всего сотрудников: <span className="text-[#f0f6fc]">{users.length}</span>
          {filteredUsers.length !== users.length && (
            <span> (отфильтровано: {filteredUsers.length})</span>
          )}
        </div>
        {selectedIds.length > 0 && (
          <div className="text-[#38bdf8]">
            Выбрано строк: {selectedIds.length}
          </div>
        )}
      </div>
    </div>
  );
};
