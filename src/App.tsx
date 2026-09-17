import React, { useState, useEffect, useCallback } from 'react';


import {Header} from './components/Header';

import type {
  Task,
  Plan,
  User,
  Position,
  EntityView,
  ActiveFilters,
  DatabaseStats,
  DrawerMode,
  TaskStatus,
} from '../types/index';
import { TableView } from './components/TableView';
import { CrudDrawer } from './components/CrudDrawer';
import { ProjectSwitcherModal } from './components/ProjectSwitcherModal';
import { CommandPalette } from './components/CommandPallete';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { Sidebar } from './components/Sidebar';


import { UsersTableView } from './components/UsersTableView';
import { PositionsTableView } from './components/PositionsTable'
import { LoginPage } from './components/LoginPage';


export default function App() {
  // Authentication State: null by default so Login Page is shown by default!
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Active view state: 'tasks' | 'plans' | 'users' | 'positions'
  const [currentView, setCurrentView] = useState<EntityView>('tasks');

  // Data collections
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [queryLatencyMs, setQueryLatencyMs] = useState('0.8ms');

  // Filters & Sorting for Tasks/Plans
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'in_progress',
  });
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Row selection for Tasks
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([1, 2]);

  // Drawer & Editing entities
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('none');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // Modals
  const [apiExplorerOpen, setApiExplorerOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Restore saved session if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bplan_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch Database Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/db/info');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch DB stats:', err);
    }
  }, []);

  // Fetch Plans
  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  }, []);

  // Fetch Tasks with query params
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const params = new URLSearchParams();
      if (activeFilters.status) params.set('status', activeFilters.status);
      if (activeFilters.priority) params.set('priority', activeFilters.priority);
      if (activeFilters.plan_id) params.set('plan_id', String(activeFilters.plan_id));
      if (activeFilters.search) params.set('search', activeFilters.search);
      params.set('sort', sortBy);
      params.set('order', sortOrder);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const duration = (performance.now() - start).toFixed(1);
      setQueryLatencyMs(`${duration}ms`);

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, sortBy, sortOrder]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch Positions
  const fetchPositions = useCallback(async () => {
    setPositionsLoading(true);
    try {
      const res = await fetch('/api/positions');
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      }
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    } finally {
      setPositionsLoading(false);
    }
  }, []);

  // Load all initial data
  useEffect(() => {
    fetchStats();
    fetchPlans();
    fetchTasks();
    fetchUsers();
    fetchPositions();
  }, [fetchStats, fetchPlans, fetchTasks, fetchUsers, fetchPositions]);

  // Handle Login Success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('bplan_active_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  // Handle Continue as Guest
  const handleContinueAsGuest = () => {
    const guestUser: User = {
      id: 0,
      email: 'guest@bplan.dev',
      username: 'guest',
      full_name: 'Гостевой доступ',
      avatar_url: null,
      position_id: null,
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };
    handleLoginSuccess(guestUser);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bplan_active_user');
    } catch {
      // ignore
    }
  };

  // Handle Sort Toggle
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  // Filter Updates
  const handleFilterChange = (filters: Partial<ActiveFilters>) => {
    setActiveFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  // Selection handlers
  const handleToggleSelectTask = (id: number) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllTasks = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  };

  // Task CRUD
  const handleSaveTask = async (taskData: Partial<Task>) => {
    const isEdit = Boolean(taskData.id);
    const url = isEdit ? `/api/tasks/${taskData.id}` : '/api/tasks';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось сохранить задачу');
    }

    await fetchTasks();
    await fetchStats();
  };

  const handleDeleteTask = async (id: number) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось удалить задачу');
    }
    setSelectedTaskIds((prev) => prev.filter((item) => item !== id));
    await fetchTasks();
    await fetchStats();
  };

  // Plan CRUD
  const handleSavePlan = async (planData: Partial<Plan>) => {
    const isEdit = Boolean(planData.id);
    const url = isEdit ? `/api/plans/${planData.id}` : '/api/plans';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось сохранить план');
    }

    await fetchPlans();
    await fetchStats();
  };

  const handleDeletePlan = async (id: number) => {
    const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось удалить план');
    }
    await fetchPlans();
    await fetchTasks();
    await fetchStats();
  };

  // User CRUD
  const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
    const isEdit = Boolean(userData.id);
    const url = isEdit ? `/api/users/${userData.id}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось сохранить пользователя');
    }

    await fetchUsers();
    await fetchPositions();
    await fetchStats();
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm(`Вы уверены, что хотите удалить пользователя #${id}?`)) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось удалить пользователя');
      }
      await fetchUsers();
      await fetchPositions();
      await fetchStats();
    }
  };

  // Position CRUD
  const handleSavePosition = async (positionData: Partial<Position>) => {
    const isEdit = Boolean(positionData.id);
    const url = isEdit ? `/api/positions/${positionData.id}` : '/api/positions';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(positionData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось сохранить должность');
    }

    await fetchPositions();
    await fetchUsers();
    await fetchStats();
  };

  const handleDeletePosition = async (id: number) => {
    if (confirm(`Вы уверены, что хотите удалить должность #${id}?`)) {
      const res = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось удалить должность');
      }
      await fetchPositions();
      await fetchUsers();
      await fetchStats();
    }
  };

  // Batch actions
  const handleBatchStatusChange = async (status: TaskStatus) => {
    if (selectedTaskIds.length === 0) return;
    const res = await fetch('/api/tasks/batch-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedTaskIds, status }),
    });
    if (res.ok) {
      await fetchTasks();
      await fetchStats();
    }
  };

  const handleBatchPlanChange = async (planId: number) => {
    if (selectedTaskIds.length === 0) return;
    const res = await fetch('/api/tasks/batch-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedTaskIds, plan_id: planId }),
    });
    if (res.ok) {
      await fetchTasks();
      await fetchStats();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Удалить выбранные задачи (${selectedTaskIds.length} шт.)?`)) {
      const res = await fetch('/api/tasks/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTaskIds }),
      });
      if (res.ok) {
        setSelectedTaskIds([]);
        await fetchTasks();
        await fetchStats();
      }
    }
  };

  // Export Data Dump
  const handleExportData = () => {
    window.location.href = '/api/db/export';
  };

  // Reset Database
  const handleResetDatabase = async () => {
    await fetch('/api/db/reset', { method: 'POST' });
    setSelectedTaskIds([1, 2]);
    await fetchPlans();
    await fetchTasks();
    await fetchUsers();
    await fetchPositions();
    await fetchStats();
  };

  // IF NOT LOGGED IN: Render Login Page by default!
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="bg-[#0b0f19] text-[#dfe2eb] font-sans antialiased flex flex-col h-screen overflow-hidden select-none">
      {/* Top Header Navigation */}
      <Header
        currentView={currentView}
        searchQuery={activeFilters.search || ''}
        currentUser={currentUser}
        onSearchChange={(search) => handleFilterChange({ search })}
        onOpenNewTask={() => {
          setEditingTask(null);
          setDrawerMode('new-task');
        }}
        onOpenNewPlan={() => {
          setEditingPlan(null);
          setDrawerMode('new-plan');
        }}
        onOpenNewUser={() => {
          setEditingUser(null);
          setDrawerMode('new-user');
        }}
        onOpenNewPosition={() => {
          setEditingPosition(null);
          setDrawerMode('new-position');
        }}
        onOpenApiExplorer={() => setApiExplorerOpen(true)}
        onOpenProjectModal={() => setProjectModalOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onExportData={handleExportData}
        onLogout={handleLogout}
        onSwitchToLogin={handleLogout}
      />

      {/* Main Workspace: Sidebar + Central Table + CRUD Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Minimal Application Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          stats={stats}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Center Workspace: Data Grid & Controls */}
        {currentView === 'tasks' || currentView === 'plans' ? (
          <TableView
            currentView={currentView}
            tasks={tasks}
            plans={plans}
            loading={loading}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onRefresh={() => {
              fetchTasks();
              fetchPlans();
              fetchStats();
            }}
            onAddRecord={() => {
              if (currentView === 'tasks') {
                setEditingTask(null);
                setDrawerMode('new-task');
              } else {
                setEditingPlan(null);
                setDrawerMode('new-plan');
              }
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setDrawerMode('edit-task');
            }}
            onDeleteTask={handleDeleteTask}
            onEditPlan={(plan) => {
              setEditingPlan(plan);
              setDrawerMode('edit-plan');
            }}
            onDeletePlan={handleDeletePlan}
            onBatchStatusChange={handleBatchStatusChange}
            onBatchPlanChange={handleBatchPlanChange}
            onBatchDelete={handleBatchDelete}
            selectedTaskIds={selectedTaskIds}
            onToggleSelectTask={handleToggleSelectTask}
            onToggleSelectAllTasks={handleToggleSelectAllTasks}
            queryLatencyMs={queryLatencyMs}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onSelectPlanForTasks={(planId) => {
              setCurrentView('tasks');
              handleFilterChange({ plan_id: planId });
            }}
          />
        ) : currentView === 'users' ? (
          <UsersTableView
            users={users}
            positions={positions}
            loading={usersLoading}
            onOpenNewUser={() => {
              setEditingUser(null);
              setDrawerMode('new-user');
            }}
            onEditUser={(user) => {
              setEditingUser(user);
              setDrawerMode('edit-user');
            }}
            onDeleteUser={handleDeleteUser}
          />
        ) : (
          <PositionsTableView
            positions={positions}
            loading={positionsLoading}
            onOpenNewPosition={() => {
              setEditingPosition(null);
              setDrawerMode('new-position');
            }}
            onEditPosition={(position) => {
              setEditingPosition(position);
              setDrawerMode('edit-position');
            }}
            onDeletePosition={handleDeletePosition}
          />
        )}

        {/* Side Drawer: CRUD Editor */}
        <CrudDrawer
          mode={drawerMode}
          initialTask={editingTask}
          initialPlan={editingPlan}
          initialUser={editingUser}
          initialPosition={editingPosition}
          plans={plans}
          positions={positions}
          onClose={() => setDrawerMode('none')}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          onSavePlan={handleSavePlan}
          onDeletePlan={handleDeletePlan}
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
          onSavePosition={handleSavePosition}
          onDeletePosition={handleDeletePosition}
        />
      </div>

      {/* API Explorer Modal (for testing all bplan endpoints) */}
      <ApiExplorerModal
        isOpen={apiExplorerOpen}
        onClose={() => setApiExplorerOpen(false)}
        onDatabaseMutated={() => {
          fetchTasks();
          fetchPlans();
          fetchUsers();
          fetchPositions();
          fetchStats();
        }}
      />

      {/* Database Connection & Settings Modal */}
      <ProjectSwitcherModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        stats={stats}
        onResetDatabase={handleResetDatabase}
      />

      {/* ⌘K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        tasks={tasks}
        plans={plans}
        users={users}
        positions={positions}
        onSelectTask={(task) => {
          setCurrentView('tasks');
          setEditingTask(task);
          setDrawerMode('edit-task');
        }}
        onSelectPlan={(plan) => {
          setCurrentView('plans');
          setEditingPlan(plan);
          setDrawerMode('edit-plan');
        }}
        onSelectUser={(user) => {
          setCurrentView('users');
          setEditingUser(user);
          setDrawerMode('edit-user');
        }}
        onSelectPosition={(pos) => {
          setCurrentView('positions');
          setEditingPosition(pos);
          setDrawerMode('edit-position');
        }}
        onViewChange={setCurrentView}
        onOpenNewTask={() => {
          setCurrentView('tasks');
          setEditingTask(null);
          setDrawerMode('new-task');
        }}
        onOpenNewPlan={() => {
          setCurrentView('plans');
          setEditingPlan(null);
          setDrawerMode('new-plan');
        }}
        onOpenNewUser={() => {
          setCurrentView('users');
          setEditingUser(null);
          setDrawerMode('new-user');
        }}
        onOpenNewPosition={() => {
          setCurrentView('positions');
          setEditingPosition(null);
          setDrawerMode('new-position');
        }}
        onOpenApiExplorer={() => setApiExplorerOpen(true)}
        onExportData={handleExportData}
        onFilterStatus={(st) => {
          setCurrentView('tasks');
          handleFilterChange({ status: st });
        }}
      />
    </div>
  );
}
