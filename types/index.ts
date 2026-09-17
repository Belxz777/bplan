export type PlanStatus = 'active' | 'completed' | 'archived';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type UserRole = 'admin' | 'manager' | 'user';

export type UserStatus = 'active' | 'inactive' | 'banned';

export type PositionLevel = 'intern' | 'junior' | 'middle' | 'senior' | 'lead' | 'head';

export interface Position {
  id: number;
  title: string;
  description: string | null;
  department: string;
  level: PositionLevel;
  created_at: string;
  updated_at: string;
  users_count?: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  position_id: number | null;
  role: UserRole;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  position_title?: string | null;
  position_department?: string | null;
}

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
  tasks_count?: number;
}

export interface Task {
  id: number;
  plan_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  plan_name?: string;
}

export interface DatabaseStats {
  sqliteVersion: string;
  journalMode: string;
  foreignKeys: boolean;
  totalTasks: number;
  totalPlans: number;
  totalUsers: number;
  totalPositions: number;
  statusCounts: {
    todo: number;
    in_progress: number;
    done: number;
    cancelled: number;
  };
  priorityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  planLifecycleCounts: {
    active: number;
    completed: number;
    archived: number;
  };
}

export type EntityView = 'tasks' | 'plans' | 'users' | 'positions';

export interface ActiveFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  plan_id?: number;
  planLifecycle?: PlanStatus;
  userRole?: UserRole;
  userStatus?: UserStatus;
  department?: string;
  level?: PositionLevel;
  search?: string;
}

export type DrawerMode =
  | 'none'
  | 'new-task'
  | 'edit-task'
  | 'new-plan'
  | 'edit-plan'
  | 'new-user'
  | 'edit-user'
  | 'new-position'
  | 'edit-position';

export interface ApiEndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: string;
}
