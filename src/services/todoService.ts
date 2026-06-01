import { supabase } from '../app/services/supabaseClient';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoTask {
  id: string;
  user_id: string;
  title: string;
  note?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  is_completed: boolean;
  is_starred: boolean;
  tags: string[];
  subtasks: SubTask[];
  created_at?: string;
  completed_at?: string;
}

const LOCAL_STORAGE_KEY = 'ds_todo_tasks';

// Premium onboarding seed tasks
const SEED_TASKS = [
  {
    title: 'Launch DailyStack Beta on TestFlight 🚀',
    note: 'Make sure compile build verification is green and responsive viewport handles iPhone 12/SE SE screen width.',
    priority: 'high' as const,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_starred: true,
    tags: ['release', 'mobile']
  },
  {
    title: 'Sync SCB Credit Card to Smart Wallet 💳',
    note: 'Ensure double-entry transactions reflect correctly under accounts and net worth calculations.',
    priority: 'high' as const,
    due_date: new Date().toISOString().split('T')[0],
    is_starred: false,
    tags: ['fintech', 'wallet']
  },
  {
    title: 'Redesign Obsidian Glassmorphic Dashboard 🎨',
    note: 'Polish grid spacing columns with repeat(3, minmax(0, 1fr)) and absolute center ProgressRing text layers.',
    priority: 'medium' as const,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_starred: false,
    tags: ['ui-ux']
  },
  {
    title: 'Schedule daily learning micro-habits 📚',
    note: 'UPSKILL DAILY: use streaks tracking to log 5+ minutes of reading every morning.',
    priority: 'low' as const,
    is_starred: false,
    tags: ['growth', 'habits']
  }
];

export const TodoService = {
  // Get current user id
  async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  },

  // GET ALL TASKS
  async getTasks(): Promise<TodoTask[]> {
    const userId = await this.getUserId();
    
    // Offline / Not Authenticated Fallback
    if (!userId) {
      this.initLocalData();
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('is_completed', { ascending: true })
        .order('is_starred', { ascending: false })
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        await this.seedTasks(userId);
        return this.getTasks();
      }

      return data.map(row => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        note: row.note || undefined,
        priority: row.priority,
        due_date: row.due_date || undefined,
        is_completed: row.is_completed,
        is_starred: row.is_starred,
        tags: row.tags || [],
        subtasks: row.subtasks || [],
        created_at: row.created_at,
        completed_at: row.completed_at || undefined
      }));
    } catch (e) {
      console.warn('Supabase getTasks error, fallback to local cache:', e);
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    }
  },

  // CREATE TASK
  async createTask(data: Omit<TodoTask, 'id' | 'user_id' | 'is_completed' | 'is_starred' | 'tags' | 'subtasks'>): Promise<TodoTask | null> {
    const userId = await this.getUserId();
    
    if (!userId) {
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const newTask: TodoTask = {
        ...data,
        id: `task-${Date.now()}`,
        user_id: 'local-user',
        is_completed: false,
        is_starred: false,
        tags: [],
        subtasks: []
      };
      localTasks.unshift(newTask);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localTasks));
      return newTask;
    }

    try {
      const { data: row, error } = await supabase
        .from('todo_tasks')
        .insert({
          user_id: userId,
          title: data.title,
          note: data.note || null,
          priority: data.priority,
          due_date: data.due_date || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        note: row.note || undefined,
        priority: row.priority,
        due_date: row.due_date || undefined,
        is_completed: row.is_completed,
        is_starred: row.is_starred,
        tags: row.tags || [],
        subtasks: row.subtasks || [],
        created_at: row.created_at,
        completed_at: row.completed_at || undefined
      };
    } catch (e) {
      console.warn('Supabase createTask error, writing to Local Storage:', e);
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const newTask: TodoTask = {
        ...data,
        id: `task-${Date.now()}`,
        user_id: userId,
        is_completed: false,
        is_starred: false,
        tags: [],
        subtasks: []
      };
      localTasks.unshift(newTask);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localTasks));
      return newTask;
    }
  },

  // UPDATE TASK
  async updateTask(id: string, updates: Partial<TodoTask>): Promise<boolean> {
    const userId = await this.getUserId();

    if (!userId) {
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = localTasks.map(t => {
        if (t.id !== id) return t;
        const newCompletedVal = updates.is_completed !== undefined ? updates.is_completed : t.is_completed;
        return {
          ...t,
          ...updates,
          completed_at: newCompletedVal && !t.is_completed ? new Date().toISOString() : (!newCompletedVal ? undefined : t.completed_at)
        };
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }

    try {
      const dbUpdates: any = { ...updates };
      delete dbUpdates.id;
      delete dbUpdates.user_id;
      delete dbUpdates.created_at;

      // Handle standard completed_at auto-management
      if (updates.is_completed !== undefined) {
        dbUpdates.completed_at = updates.is_completed ? new Date().toISOString() : null;
      }
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('todo_tasks')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase updateTask error, writing to local cache:', e);
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = localTasks.map(t => {
        if (t.id !== id) return t;
        const newCompletedVal = updates.is_completed !== undefined ? updates.is_completed : t.is_completed;
        return {
          ...t,
          ...updates,
          completed_at: newCompletedVal && !t.is_completed ? new Date().toISOString() : (!newCompletedVal ? undefined : t.completed_at)
        };
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  },

  // DELETE TASK
  async deleteTask(id: string): Promise<boolean> {
    const userId = await this.getUserId();

    if (!userId) {
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const filtered = localTasks.filter(t => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }

    try {
      const { error } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase deleteTask error, executing Local:', e);
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const filtered = localTasks.filter(t => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  // GET ACTIVE TASKS COUNT FOR DYNAMIC COUNTERS
  async getActiveTasksCount(): Promise<number> {
    const userId = await this.getUserId();
    if (!userId) {
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      return localTasks.filter(t => !t.is_completed).length;
    }

    try {
      const { count, error } = await supabase
        .from('todo_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_completed', false);

      if (error) throw error;
      return count || 0;
    } catch {
      const localTasks: TodoTask[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      return localTasks.filter(t => !t.is_completed).length;
    }
  },

  // Auto-seeds standard tasks on Supabase database
  async seedTasks(userId: string): Promise<void> {
    try {
      const seedRows = SEED_TASKS.map(task => ({
        ...task,
        user_id: userId
      }));
      await supabase.from('todo_tasks').insert(seedRows);
    } catch (e) {
      console.warn('Failed to seed Supabase tasks:', e);
    }
  },

  // Initialize offline Local Storage state
  initLocalData() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
      const seedLocal = SEED_TASKS.map((t, i) => ({
        ...t,
        id: `task-seed-${i}`,
        user_id: 'local-user',
        is_completed: false,
        tags: t.tags || [],
        subtasks: []
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seedLocal));
    }
  }
};
