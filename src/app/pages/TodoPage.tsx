import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star, Calendar, AlertCircle, Plus, Trash2, 
  ChevronRight, ListTodo, X, FileText, CheckSquare, Sparkles 
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Shell } from '../components/DesignSystem';
import { TodoService } from '../../services/todoService';
import type { TodoTask, SubTask } from '../../services/todoService';
import { datingAnalytics } from '../../services/datingAnalytics';

// Custom Material Symbol Icon component
const MaterialIcon: React.FC<{ name: string; size?: number; className?: string; style?: React.CSSProperties }> = ({
  name, size = 20, className = '', style
}) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, ...style }}>{name}</span>
);

export const TodoPage: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isThai = language === 'th';
  
  // Tasks state
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filter tabs
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'due' | 'completed'>('all');
  
  // Quick Add State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [showQuickAddDetails, setShowQuickAddDetails] = useState<boolean>(false);

  // Selected Detail Task State
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');

  // Fetch tasks
  const fetchTasks = async () => {
    setIsLoading(true);
    const data = await TodoService.getTasks();
    setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Quick Add Submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await TodoService.createTask({
      title: newTitle.trim(),
      priority: newPriority,
      due_date: newDueDate || undefined
    });

    // Telemetry log
    datingAnalytics.trackFeatureUsage('todo', 'create_task', 1, {
      priority: newPriority,
      has_due_date: !!newDueDate
    });

    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
    setShowQuickAddDetails(false);
    await fetchTasks();
  };

  // Toggle Completion
  const handleToggleComplete = async (task: TodoTask) => {
    const nextVal = !task.is_completed;
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(nextVal ? 800 : 400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {}

    await TodoService.updateTask(task.id, { is_completed: nextVal });
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('todo', nextVal ? 'complete_task' : 'uncomplete_task', 1, {
      task_id: task.id,
      priority: task.priority
    });

    await fetchTasks();
    if (selectedTask?.id === task.id) {
      setSelectedTask(prev => prev ? { ...prev, is_completed: nextVal } : null);
    }
  };

  // Toggle Starred
  const handleToggleStar = async (e: React.MouseEvent, task: TodoTask) => {
    e.stopPropagation();
    const nextVal = !task.is_starred;
    await TodoService.updateTask(task.id, { is_starred: nextVal });
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('todo', nextVal ? 'star_task' : 'unstar_task', 1, {
      task_id: task.id
    });

    await fetchTasks();
    if (selectedTask?.id === task.id) {
      setSelectedTask(prev => prev ? { ...prev, is_starred: nextVal } : null);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    await TodoService.deleteTask(id);
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('todo', 'delete_task', 1, {
      task_id: id
    });

    setSelectedTask(null);
    await fetchTasks();
  };

  // Update Detail Panel Field
  const handleUpdateDetail = async (field: keyof TodoTask, value: any) => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, [field]: value };
    setSelectedTask(updated);
    await TodoService.updateTask(selectedTask.id, { [field]: value });
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
  };

  // Add Subtask Checklist
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const updatedSubs = [...(selectedTask.subtasks || []), newSub];
    await handleUpdateDetail('subtasks', updatedSubs);
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('todo', 'create_subtask', 1, {
      task_id: selectedTask.id
    });

    setNewSubtaskTitle('');
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = async (subId: string) => {
    if (!selectedTask) return;
    const updatedSubs = selectedTask.subtasks.map(sub => 
      sub.id === subId ? { ...sub, completed: !sub.completed } : sub
    );
    await handleUpdateDetail('subtasks', updatedSubs);
    
    // Telemetry log
    const sub = selectedTask.subtasks.find(s => s.id === subId);
    datingAnalytics.trackFeatureUsage('todo', sub?.completed ? 'uncomplete_subtask' : 'complete_subtask', 1, {
      task_id: selectedTask.id,
      subtask_id: subId
    });
  };

  // Delete Subtask
  const handleDeleteSubtask = async (subId: string) => {
    if (!selectedTask) return;
    const updatedSubs = selectedTask.subtasks.filter(sub => sub.id !== subId);
    await handleUpdateDetail('subtasks', updatedSubs);

    // Telemetry log
    datingAnalytics.trackFeatureUsage('todo', 'delete_subtask', 1, {
      task_id: selectedTask.id,
      subtask_id: subId
    });
  };

  // Group Filter Logic
  const getFilteredTasks = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    switch (activeTab) {
      case 'starred':
        return tasks.filter(t => t.is_starred);
      case 'due':
        return tasks.filter(t => t.due_date && t.due_date <= todayStr && !t.is_completed);
      case 'completed':
        return tasks.filter(t => t.is_completed);
      case 'all':
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const activeCount = tasks.filter(t => !t.is_completed).length;

  const getPriorityDot = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse';
      case 'medium':
        return 'w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'low':
        return 'w-2 h-2 rounded-full bg-sky-400';
    }
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr < todayStr;
  };

  const getSubtasksProgress = (task: TodoTask) => {
    const subs = task.subtasks || [];
    if (subs.length === 0) return 0;
    const completed = subs.filter(s => s.completed).length;
    return Math.round((completed / subs.length) * 100);
  };

  return (
    <Shell lang={language} showNav={true} showLangToggle={false} showOrbs={true}>
      <div className="screen select-none relative flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="flex items-center gap-3 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-6 py-4 shadow-sm select-none">
          <div className="w-10 h-10 rounded-xl bg-[var(--neon-surface)] flex items-center justify-center border border-[var(--neon-glow-sm)]">
            <ListTodo className="w-5 h-5 text-[var(--neon)]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--text-primary)] font-space flex items-center gap-1.5 leading-none">
              {isThai ? 'เป้าหมายและรายการงาน' : 'Lark Task Center'}
              <span className="text-[10px] px-2 py-0.5 bg-[var(--surface-3)] text-[var(--text-muted)] rounded-full font-mono font-bold leading-none">{activeCount}</span>
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium tracking-tight">
              {isThai ? 'จัดการสลักงานสำคัญเรียงลำดับความเร่งด่วน' : 'Prioritized workflow collaboration'}
            </p>
          </div>
        </header>

        {/* SCROLLABLE PANEL CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* TAB FILTERS */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl font-space text-[10px] font-bold tracking-tight shadow-md">
            {[
              { id: 'all', label: isThai ? 'ทั้งหมด' : 'Inbox' },
              { id: 'starred', label: isThai ? 'ติดดาว' : 'Starred' },
              { id: 'due', label: isThai ? 'ต้องทำ' : 'Due Today' },
              { id: 'completed', label: isThai ? 'เสร็จสิ้น' : 'Done' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 text-center rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[var(--neon-surface)] text-[var(--neon)] border border-[var(--neon-glow-xs)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* QUICK ADD FORM */}
          <form onSubmit={handleQuickAdd} className="bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-2xl p-3.5 space-y-2 shadow-md hover:border-[var(--neon-glow)] transition-all">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isThai ? 'เพิ่มหัวข้องานใหม่ที่นี่...' : 'Type task and press enter...'}
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!showQuickAddDetails && e.target.value.length > 0) {
                    setShowQuickAddDetails(true);
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-gray-650 font-medium"
              />
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                  newTitle.trim()
                    ? 'bg-[var(--neon)] text-black'
                    : 'bg-gray-800 text-gray-650 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showQuickAddDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 pt-2 border-t border-gray-850 font-mono text-[9px] font-bold"
              >
                <div className="flex items-center gap-1">
                  <span className="text-gray-650 uppercase">Priority:</span>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="bg-[var(--surface-4)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[var(--text-primary)] outline-none select-custom pr-3"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3 text-gray-650" />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="bg-[var(--surface-4)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[var(--text-primary)] outline-none"
                  />
                </div>
              </motion.div>
            )}
          </form>

          {/* TASK LIST LEDGER */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-900/60 border border-gray-850 rounded-xl" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-850 flex items-center justify-center text-gray-650">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400">
                    {isThai ? 'ไม่มีรายการเป้าหมายค้าง' : 'No tasks in this list'}
                  </h4>
                  <p className="text-[10px] text-gray-600 mt-1 max-w-[200px]">
                    {isThai ? 'จัดการขจัดขีดฆ่างานเสร็จเรียบร้อยแล้ว ยอดเยี่ยมมาก!' : 'Add new tasks or view finished checkmarks.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredTasks.map(task => {
                const subCount = task.subtasks?.length || 0;
                const progress = getSubtasksProgress(task);
                const isOver = isOverdue(task.due_date) && !task.is_completed;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`group flex items-center gap-3 bg-[var(--surface-3)] border border-[var(--border-subtle)] hover:border-gray-700 rounded-xl p-3 cursor-pointer transition-all active:scale-[0.99] ${
                      task.is_completed ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task);
                      }}
                      className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                        task.is_completed
                          ? 'bg-[#56BE89] border-[#56BE89] text-black'
                          : 'border-gray-700 hover:border-[var(--neon)] bg-transparent'
                      }`}
                      aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-semibold text-[var(--text-primary)] tracking-tight leading-tight truncate ${
                        task.is_completed ? 'line-through text-gray-600 font-medium' : ''
                      }`}>
                        {task.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 font-mono text-[8px] font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className={getPriorityDot(task.priority)} />
                          <span className="text-gray-600 uppercase">{task.priority}</span>
                        </div>

                        {task.due_date && (
                          <span className={`flex items-center gap-0.5 ${
                            isOver ? 'text-red-500 animate-pulse' : 'text-gray-650'
                          }`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {task.due_date}
                          </span>
                        )}

                        {subCount > 0 && (
                          <span className="text-[var(--neon)]">
                            {task.subtasks.filter(s => s.completed).length}/{subCount} ({progress}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(e, task)}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                        task.is_starred 
                          ? 'text-yellow-400 bg-yellow-500/5' 
                          : 'text-gray-650 opacity-0 group-hover:opacity-100 hover:text-gray-400'
                      }`}
                      aria-label={task.is_starred ? "Remove star" : "Star task"}
                    >
                      <Star className={`w-3.5 h-3.5 ${task.is_starred ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* SLIDING DETAIL DRAWER PANEL */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-x-0 bottom-0 bg-[var(--bg-elevated)] rounded-t-[32px] border-t border-[var(--neon-glow)] p-6 z-20 flex flex-col max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div 
                className="w-12 h-1 bg-gray-850 rounded-full mx-auto mb-4 cursor-pointer" 
                onClick={() => setSelectedTask(null)} 
              />

              <div className="flex items-center justify-between mb-4 border-b border-gray-850 pb-3 font-mono text-[9px] font-bold">
                <span className="text-[var(--neon)] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Task Detail Inspector
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleStar(e, selectedTask)}
                    className={`p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-4)] transition-all ${
                      selectedTask.is_starred ? 'text-yellow-400' : 'text-[var(--text-secondary)]'
                    }`}
                    aria-label={selectedTask.is_starred ? "Remove star" : "Star task"}
                  >
                    <Star className={`w-3.5 h-3.5 ${selectedTask.is_starred ? 'fill-yellow-400' : ''}`} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Close details"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-650 uppercase font-black">Title</label>
                  <input
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) => handleUpdateDetail('title', e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-bold text-[var(--text-primary)] text-xs"
                  />
                </div>

                {/* Priority & Date */}
                <div className="grid grid-cols-2 gap-3 bg-[var(--surface-3)] p-3 rounded-xl border border-[var(--border-subtle)] font-mono text-[9px] font-bold">
                  <div className="space-y-1">
                    <span className="text-gray-650 block uppercase">Priority</span>
                    <select
                      value={selectedTask.priority}
                      onChange={(e: any) => handleUpdateDetail('priority', e.target.value)}
                      className="bg-[var(--surface-4)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[var(--text-primary)] outline-none select-custom pr-4"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-650 block uppercase">Due Date</span>
                    <input
                      type="date"
                      value={selectedTask.due_date || ''}
                      onChange={(e) => handleUpdateDetail('due_date', e.target.value || null)}
                      className="bg-[var(--surface-4)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[var(--text-primary)] outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-gray-650 uppercase font-black flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Notes / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isThai ? 'เขียนรายละเอียดบันทึกเพิ่มเติมสำหรับงานที่นี่...' : 'Add details or descriptions here...'}
                    value={selectedTask.note || ''}
                    onChange={(e) => handleUpdateDetail('note', e.target.value || '')}
                    className="w-full bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl p-3 text-[11px] text-[var(--text-secondary)] placeholder-gray-750 outline-none resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Subtasks checklists */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono text-gray-650 uppercase font-black flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" /> Subtasks Checklist
                    </label>
                    {selectedTask.subtasks?.length > 0 && (
                      <span className="text-[9px] font-mono text-[var(--neon)] font-bold">
                        {getSubtasksProgress(selectedTask)}% Completed
                      </span>
                    )}
                  </div>

                  {selectedTask.subtasks?.length > 0 && (
                    <div className="h-1.5 bg-gray-900/10 border border-[var(--border-subtle)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--neon)] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(192,245,0,0.5)]"
                        style={{ width: `${getSubtasksProgress(selectedTask)}%` }}
                      />
                    </div>
                  )}

                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isThai ? 'เพิ่มรายการย่อยใหม่...' : 'Add a subtask...'}
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-[var(--surface-3)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[10px] text-[var(--text-primary)] placeholder-gray-700 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className={`px-3 rounded-xl font-bold text-[10px] flex items-center justify-center cursor-pointer ${
                        newSubtaskTitle.trim()
                          ? 'bg-[var(--neon-surface)] text-[var(--neon)] border border-[var(--neon-glow-xs)]'
                          : 'bg-[var(--surface-3)] border border-[var(--border-subtle)] text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                  </form>

                  <div className="space-y-1.5 pb-6">
                    {selectedTask.subtasks?.map(sub => (
                      <div 
                        key={sub.id}
                        className="flex items-center gap-2 bg-gray-900/5 p-2.5 rounded-xl border border-[var(--border-subtle)]"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(sub.id)}
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                            sub.completed
                              ? 'bg-[var(--neon)] border-[var(--neon)] text-black'
                              : 'border-gray-700 hover:border-[var(--neon)]'
                          }`}
                          aria-label={sub.completed ? "Mark subtask incomplete" : "Mark subtask complete"}
                        >
                          {sub.completed && <CheckCircle2 className="w-2.5 h-2.5 text-black stroke-[3]" />}
                        </button>
                        
                        <span className={`text-[10px] font-medium text-[var(--text-primary)] flex-1 truncate ${
                          sub.completed ? 'line-through text-gray-550' : ''
                        }`}>
                          {sub.title}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(sub.id)}
                          className="text-gray-650 hover:text-red-400 p-0.5 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Shell>
  );
};
export default TodoPage;
