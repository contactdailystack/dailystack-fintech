import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star, Calendar, AlertCircle, Plus, Trash2, 
  ChevronRight, ListTodo, X, FileText, CheckSquare, Sparkles 
} from 'lucide-react';

import { TodoService } from '../../services/todoService';
import type { TodoTask, SubTask } from '../../services/todoService';

interface LarkTodoListProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'th';
  onTaskChange?: () => void;
}

export const LarkTodoList: React.FC<LarkTodoListProps> = ({ isOpen, onClose, lang, onTaskChange }) => {
  const isThai = lang === 'th';
  
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
    if (onTaskChange) onTaskChange();
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  // Handle Quick Add Submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await TodoService.createTask({
      title: newTitle.trim(),
      priority: newPriority,
      due_date: newDueDate || undefined
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
    
    // Play subtle audio click feedback if available
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
    await fetchTasks();
    if (selectedTask?.id === task.id) {
      setSelectedTask(prev => prev ? { ...prev, is_starred: nextVal } : null);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    await TodoService.deleteTask(id);
    setSelectedTask(null);
    await fetchTasks();
  };

  // Update Detail Panel Field
  const handleUpdateDetail = async (field: keyof TodoTask, value: any) => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, [field]: value };
    setSelectedTask(updated);
    await TodoService.updateTask(selectedTask.id, { [field]: value });
    // Live update in local checklist state
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
    setNewSubtaskTitle('');
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = async (subId: string) => {
    if (!selectedTask) return;
    const updatedSubs = selectedTask.subtasks.map(sub => 
      sub.id === subId ? { ...sub, completed: !sub.completed } : sub
    );
    await handleUpdateDetail('subtasks', updatedSubs);
  };

  // Delete Subtask
  const handleDeleteSubtask = async (subId: string) => {
    if (!selectedTask) return;
    const updatedSubs = selectedTask.subtasks.filter(sub => sub.id !== subId);
    await handleUpdateDetail('subtasks', updatedSubs);
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

  // Subtask Progress calculation
  const getSubtasksProgress = (task: TodoTask) => {
    const subs = task.subtasks || [];
    if (subs.length === 0) return 0;
    const completed = subs.filter(s => s.completed).length;
    return Math.round((completed / subs.length) * 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end select-none">
          {/* Backdrop Blur overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Lark Task Board Slider - Professional Light Mode Theme */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#F9FAFB] border-t border-[#E5E7EB] rounded-t-[32px] p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden"
          >
            
            {/* Elegant dragging bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-5 cursor-pointer hover:bg-gray-400 transition-colors" onClick={onClose} />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--neon-surface)] flex items-center justify-center border border-[var(--neon-light)] shadow-sm">
                  <ListTodo className="w-5 h-5 text-[var(--text-primary)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827] font-space flex items-center gap-2 leading-none">
                    {isThai ? 'งานที่ต้องทำ' : 'Lark Task List'}
                    <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-mono font-bold leading-none">{activeCount}</span>
                  </h3>
                  <p className="text-[11px] text-[#4B5563] font-normal tracking-tight mt-1 leading-none">
                    {isThai ? 'ผู้ช่วยติดตามสถิติและลำดับความสำคัญ' : 'Lark priority task manager'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all shadow-sm border border-gray-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB SELECTORS (Notion Pill Switchers - Refactored for spacious Light Mode) */}
            <div className="overflow-x-auto scrollbar-hide py-1 mb-5 flex justify-center">
              <div className="flex gap-1.5 p-1 bg-gray-100/80 border border-gray-200 rounded-full shadow-sm">
                {[
                  { id: 'all', label: isThai ? 'ทั้งหมด' : 'Inbox' },
                  { id: 'starred', label: isThai ? 'ติดดาว' : 'Starred' },
                  { id: 'due', label: isThai ? 'ต้องทำ' : 'Due Today' },
                  { id: 'completed', label: isThai ? 'เสร็จสิ้น' : 'Done' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QUICK ADD FORM (Notion Ask AI Style - Refactored for spacious Light Mode) */}
            <form 
              onSubmit={handleQuickAdd} 
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-5 flex flex-col items-stretch gap-3 shadow-sm hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Visual companion badge */}
                <div className="w-7 h-7 rounded-full bg-[var(--neon-surface)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[var(--text-primary)]" />
                </div>
                <input
                  type="text"
                  placeholder={isThai ? 'พิมพ์งานที่ต้องการทำ...' : 'Type to add task...'}
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!showQuickAddDetails && e.target.value.length > 0) {
                      setShowQuickAddDetails(true);
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-[#111827] placeholder-gray-400 font-normal"
                />
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    newTitle.trim()
                      ? 'bg-[var(--neon)] text-[var(--text-primary)] shadow-sm scale-105 hover:opacity-90 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Collapsible details for quick add */}
              {showQuickAddDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-4 pt-3 border-t border-dashed border-gray-200 text-xs font-semibold"
                >
                  {/* Priority select */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 uppercase tracking-wider">PRIORITY:</span>
                    <select
                      value={newPriority}
                      onChange={(e: any) => setNewPriority(e.target.value)}
                      className="bg-gray-50 border border-[#E5E7EB] rounded-xl px-2 py-1 text-[#111827] outline-none select-custom pr-4 shadow-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Due Date select */}
                  <div className="flex items-center gap-2 ml-auto">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="bg-gray-50 border border-[#E5E7EB] rounded-xl px-2 py-1 text-[#111827] outline-none text-[9px] shadow-sm"
                    />
                  </div>
                </motion.div>
              )}
            </form>

            {/* TASK LIST LEDGER */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[250px]">
              {isLoading ? (
                /* Shimmer loading elements */
                <div className="space-y-3 animate-pulse pt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white border border-[#E5E7EB] rounded-xl" />
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                /* Empty state container */
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-gray-400 shadow-sm">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">
                      {isThai ? 'ไม่มีรายการงานค้าง' : 'No tasks found'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-[220px] font-normal leading-relaxed">
                      {isThai ? 'ทุกงานทำเสร็จเรียบร้อยดีแล้ว ปลุกพลังงานในตัวคุณ!' : 'Complete your daily checkmarks to build streaks.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Interactive Task rows - Refactored for Pilo Minimalist Light Mode */
                filteredTasks.map(task => {
                  const subCount = task.subtasks?.length || 0;
                  const progress = getSubtasksProgress(task);
                  const isOver = isOverdue(task.due_date) && !task.is_completed;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`group flex items-center gap-4 bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-[24px] p-5 cursor-pointer transition-all active:scale-[0.99] select-none shadow-sm ${
                        task.is_completed ? 'opacity-70 bg-gray-50' : ''
                      }`}
                    >
                      {/* Interactive checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(task);
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          task.is_completed
                            ? 'bg-[var(--neon)] border-[var(--neon)] text-[var(--text-primary)] shadow-sm'
                            : 'border-gray-300 hover:border-[var(--neon-dark)] bg-white'
                        }`}
                      >
                        {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>

                      {/* Title & metadata */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold text-[#111827] leading-tight truncate ${
                          task.is_completed ? 'line-through text-gray-400 font-normal' : ''
                        }`}>
                          {task.title}
                        </p>

                        {/* Badges footer */}
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-[#6B7280]">
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-[11px]">
                            <span className={getPriorityDot(task.priority)} />
                            {task.priority}
                          </span>

                          {task.due_date && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                              isOver ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-[#6B7280]'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {task.due_date}
                            </span>
                          )}

                          {subCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--neon-surface)] px-2 py-1 text-[11px] font-semibold text-[var(--text-primary)]">
                              {task.subtasks.filter(s => s.completed).length}/{subCount}
                              <span className="text-[#4B5563]">({progress}%)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flag/Star element */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(e, task)}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                          task.is_starred 
                            ? 'text-[var(--text-primary)] bg-[var(--neon-surface)] border border-[var(--neon-light)] shadow-sm' 
                            : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${task.is_starred ? 'fill-[var(--text-primary)]' : ''}`} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* DETAIL SLIDE-OUT PANEL (Lark drawer) - Refactored for Spacious Light Mode */}
            <AnimatePresence>
              {selectedTask && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="absolute inset-0 bg-[#F9FAFB] rounded-t-[32px] border-t border-[#E5E7EB] p-6 z-20 flex flex-col overflow-hidden shadow-2xl"
                >
                  {/* dragging bar to close details panel */}
                  <div 
                    className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer hover:bg-gray-400 transition-colors" 
                    onClick={() => setSelectedTask(null)} 
                  />

                  {/* Header Detail row */}
                  <div className="flex items-center justify-between mb-5 border-b border-[#E5E7EB] pb-3">
                    <span className="text-xs font-semibold text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Lark Detail Pane
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleStar(e, selectedTask)}
                        className={`p-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 transition-all ${
                          selectedTask.is_starred ? 'text-[var(--text-primary)]' : 'text-gray-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${selectedTask.is_starred ? 'fill-yellow-500' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(selectedTask.id)}
                        className="p-1.5 rounded-xl border border-red-200 text-red-500 bg-white hover:bg-red-50/50 transition-all"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedTask(null)}
                        className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white text-gray-400 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main scrolling details */}
                  <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                    
                    {/* Task Title Edit */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                      <input
                        type="text"
                        value={selectedTask.title}
                        onChange={(e) => handleUpdateDetail('title', e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 font-bold text-[#111827] text-sm outline-none focus:border-gray-400 shadow-sm"
                      />
                    </div>

                    {/* Metadata Priority & Due Date in details */}
                    <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#E5E7EB] text-sm shadow-sm">
                      <div className="space-y-1">
                        <span className="text-gray-500 block uppercase text-[10px] tracking-[0.18em]">Priority</span>
                        <select
                          value={selectedTask.priority}
                          onChange={(e: any) => handleUpdateDetail('priority', e.target.value)}
                          className="bg-gray-50 border border-[#E5E7EB] rounded-xl px-2 py-1 text-[#111827] outline-none select-custom pr-4 shadow-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-500 block uppercase">Due Date</span>
                        <input
                          type="date"
                          value={selectedTask.due_date || ''}
                          onChange={(e) => handleUpdateDetail('due_date', e.target.value || null)}
                          className="bg-gray-50 border border-[#E5E7EB] rounded-xl px-2 py-1 text-[#111827] outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Notes Detail Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" /> Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder={isThai ? 'เขียนบันทึกข้อมูลรายละเอียดงานที่นี่...' : 'Add details or descriptions here...'}
                        value={selectedTask.note || ''}
                        onChange={(e) => handleUpdateDetail('note', e.target.value || '')}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl p-3 text-sm text-[#4B5563] placeholder-gray-400 outline-none resize-none font-medium leading-relaxed shadow-sm focus:border-gray-400"
                      />
                    </div>

                    {/* Subtasks checklists slider */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-gray-400" /> Subtasks Checklist
                        </label>
                        {selectedTask.subtasks?.length > 0 && (
                          <span className="text-xs font-semibold text-[#166534]">
                            {getSubtasksProgress(selectedTask)}% Completed
                          </span>
                        )}
                      </div>

                      {/* Progressive progress bar for subtasks */}
                      {selectedTask.subtasks?.length > 0 && (
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--neon)] rounded-full transition-all duration-300 shadow-sm"
                            style={{ width: `${getSubtasksProgress(selectedTask)}%` }}
                          />
                        </div>
                      )}

                      {/* Subtask input bar */}
                      <form onSubmit={handleAddSubtask} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={isThai ? 'พิมพ์งานย่อยใหม่...' : 'Add a subtask...'}
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[10px] text-[#111827] placeholder-gray-400 outline-none shadow-sm focus:border-gray-400"
                        />
                        <button
                          type="submit"
                          disabled={!newSubtaskTitle.trim()}
                          className={`px-4 rounded-xl font-bold text-[10px] flex items-center justify-center shadow-sm cursor-pointer ${
                            newSubtaskTitle.trim()
                              ? 'bg-[var(--neon-surface)] text-[var(--text-primary)] border border-[var(--neon-light)] hover:opacity-90'
                              : 'bg-white border border-[#E5E7EB] text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Add
                        </button>
                      </form>

                      {/* Subtask listing rows */}
                      <div className="space-y-2 pb-6">
                        {selectedTask.subtasks?.map(sub => (
                          <div 
                            key={sub.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-sm hover:border-gray-300 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleSubtask(sub.id)}
                              className={`w-4 h-4 rounded-xl flex items-center justify-center border transition-all ${
                                sub.completed
                                  ? 'bg-[var(--neon)] border-[var(--neon)] text-[var(--text-primary)] shadow-sm'
                                  : 'border-gray-300 hover:border-[var(--neon-dark)] bg-white'
                              }`}
                            >
                              {sub.completed && <CheckCircle2 className="w-2.5 h-2.5 text-black stroke-[3]" />}
                            </button>
                            
                            <span className={`text-[11px] font-medium text-[#111827] flex-1 truncate ${
                              sub.completed ? 'line-through text-gray-400' : ''
                            }`}>
                              {sub.title}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleDeleteSubtask(sub.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default LarkTodoList;
