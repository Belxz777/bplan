import React, { useState } from 'react';
import type { Position, PositionLevel } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Users,
  Award,
  Layers,
} from 'lucide-react';

interface PositionsTableViewProps {
  positions: Position[];
  loading: boolean;
  onOpenNewPosition: () => void;
  onEditPosition: (position: Position) => void;
  onDeletePosition: (id: number) => void;
}

export const PositionsTableView: React.FC<PositionsTableViewProps> = ({
  positions,
  loading,
  onOpenNewPosition,
  onEditPosition,
  onDeletePosition,
}) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Unique departments for filter
  const departments = Array.from(
    new Set(positions.map((p) => p.department).filter(Boolean))
  );

  // Filtered positions
  const filteredPositions = positions.filter((p) => {
    if (departmentFilter !== 'all' && p.department !== departmentFilter)
      return false;
    if (levelFilter !== 'all' && p.level !== levelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchDept = p.department.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDept) return false;
    }
    return true;
  });

  const getLevelBadge = (level: PositionLevel) => {
    switch (level) {
      case 'intern':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#6e7681]/15 text-[#8b949e] border border-[#6e7681]/30">
            <span>Intern</span>
          </span>
        );
      case 'junior':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
            <span>Junior</span>
          </span>
        );
      case 'middle':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
            <span>Middle</span>
          </span>
        );
      case 'senior':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30">
            <span>Senior</span>
          </span>
        );
      case 'lead':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/30">
            <Award className="w-3 h-3" />
            <span>Lead</span>
          </span>
        );
      case 'head':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30">
            <Award className="w-3 h-3" />
            <span>Head</span>
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
              placeholder="Поиск должности или описания..."
              className="w-full bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] rounded-lg px-3 py-1.5 pl-8 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#6e7681] absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] text-[#f0f6fc] text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">Все отделы</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#0b0f19] border border-[#30363d] focus:border-[#38bdf8] text-[#f0f6fc] text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">Все грейды</option>
            <option value="intern">Intern</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="head">Head</option>
          </select>

          {/* Add Position Button */}
          <button
            onClick={onOpenNewPosition}
            className="px-3 py-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0b0f19] font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span> Должность</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#161b22] text-[#8b949e] uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#21262d] z-10 font-mono">
            <tr>
              <th className="px-4 py-2.5 w-14">ID</th>
              <th className="px-4 py-2.5">Должность</th>
              <th className="px-4 py-2.5">Отдел</th>
              <th className="px-4 py-2.5">Грейд</th>
              <th className="px-4 py-2.5">Сотрудники</th>
              <th className="px-4 py-2.5">Описание</th>
              <th className="px-4 py-2.5 text-right w-24">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d] font-sans">
            {loading && positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#8b949e]">
                  Загрузка списка должностей...
                </td>
              </tr>
            ) : filteredPositions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#8b949e]">
                  Должности не найдены
                </td>
              </tr>
            ) : (
              filteredPositions.map((pos) => (
                <tr
                  key={pos.id}
                  className="hover:bg-[#161b22]/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[#6e7681]">
                    #{pos.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#f0f6fc]">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                      <span>{pos.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                      <Layers className="w-3 h-3 text-[#6e7681]" />
                      <span>{pos.department}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">{getLevelBadge(pos.level)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#161b22] border border-[#30363d] text-[#f0f6fc]">
                      <Users className="w-3 h-3 text-[#38bdf8]" />
                      <span>{pos.users_count ?? 0}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] max-w-xs truncate">
                    {pos.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditPosition(pos)}
                        title="Редактировать"
                        className="p-1 text-[#8b949e] hover:text-[#38bdf8] hover:bg-[#21262d] rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePosition(pos.id)}
                        title="Удалить"
                        className="p-1 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Bar */}
      <div className="px-5 py-2.5 border-t border-[#21262d] bg-[#161b22] flex items-center justify-between text-[11px] text-[#8b949e] shrink-0 font-mono">
        <div>
          Всего должностей: <span className="text-[#f0f6fc]">{positions.length}</span>
          {filteredPositions.length !== positions.length && (
            <span> (отфильтровано: {filteredPositions.length})</span>
          )}
        </div>
      </div>
    </div>
  );
};
