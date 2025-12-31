
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format, addDays, isSameDay, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProgressRing from './components/ProgressRing';
import EventModal from './components/EventModal';
import ToastNotification from './components/ToastNotification';
import { CalendarEvent, EventCategory, Toast } from './types';

// --- Local Storage Key ---
const STORAGE_KEY = 'smart-planner-events';
const POINTS_KEY = 'smart-planner-points';
const THEME_KEY = 'smart-planner-theme';
const STREAK_KEY = 'smart-planner-streak';
const LAST_VISIT_KEY = 'smart-planner-last-visit';

// --- Default 7 Healths Routine Generator ---
const generateDefaultTasks = (dateStr: string): CalendarEvent[] => [
  {
    id: crypto.randomUUID(),
    title: "💤 Dormindo (Ciclo Profundo)",
    startTime: "00:00",
    endTime: "05:00",
    description: "Fase final do sono restaurador (Ocupando a madrugada).",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🌅 Acordar + Protocolo Luz",
    startTime: "05:00",
    endTime: "05:15",
    description: "Despertar sem telas. Hidratação imediata e exposição solar.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🧘 Higiene Mental",
    startTime: "05:15",
    endTime: "05:25",
    description: "Meditação curta ou respiração profunda.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "💪 Treino de Performance",
    startTime: "05:35",
    endTime: "06:30",
    description: "Atividade física de alta intensidade ou mobilidade.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🍳 Nutrição Funcional",
    startTime: "06:30",
    endTime: "07:00",
    description: "Primeira refeição focada em proteínas e gorduras boas.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🎯 Foco Profundo (MIT)",
    startTime: "08:00",
    endTime: "10:00",
    description: "Trabalhar na Tarefa Mais Importante do dia sem interrupções.",
    isAllDay: false, isCompleted: false, category: 'work', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "💰 Gestão Financeira",
    startTime: "13:00",
    endTime: "13:10",
    description: "Revisão rápida de lançamentos e metas.",
    isAllDay: false, isCompleted: false, category: 'personal', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🍽️ Janela de Jejum (Início)",
    startTime: "14:00",
    endTime: "14:05",
    description: "Protocolo 16:8. Início do período de não-ingestão calórica.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "📔 Balanço Diário (Estoico)",
    startTime: "19:00",
    endTime: "19:15",
    description: "O que fiz de bom? O que posso melhorar amanhã?",
    isAllDay: false, isCompleted: false, category: 'personal', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🛑 Shutdown (Desconexão)",
    startTime: "20:00",
    endTime: "21:00",
    description: "Bloqueio de luz azul. Preparação do ambiente de sono.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "💊 Suplementação Noturna",
    startTime: "21:00",
    endTime: "21:15",
    description: "Magnésio e suporte hepático final.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "🏥 Check Hepático & Relax",
    startTime: "21:15",
    endTime: "21:30",
    description: "Monitoramento de sintomas e relaxamento final.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "📖 Higiene do Sono / Leitura",
    startTime: "21:30",
    endTime: "22:00",
    description: "Leitura leve, respiração. Preparação final para deitar.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
  {
    id: crypto.randomUUID(),
    title: "💤 Dormir (Horário Sagrado)",
    startTime: "22:00",
    endTime: "23:59",
    description: "Ocupando o horário com sono restaurador. Início do ciclo.",
    isAllDay: false, isCompleted: false, category: 'health', date: dateStr
  },
];

const getCategoryColor = (category?: EventCategory, isCompleted?: boolean, isDark?: boolean, hasConflict?: boolean) => {
    if (isCompleted) {
        return isDark 
            ? 'bg-gray-700 border-gray-600 text-gray-500' 
            : 'bg-gray-50 border-gray-300 text-gray-500';
    }

    if (hasConflict) {
        return isDark
            ? 'bg-red-900/40 border-red-500 text-red-100'
            : 'bg-red-50 border-red-400 text-red-800';
    }

    switch (category) {
        case 'work':
            return isDark 
                ? 'bg-blue-900/30 border-blue-500/50 text-blue-100' 
                : 'bg-blue-50 border-blue-300 text-blue-800';
        case 'health':
            return isDark 
                ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-100' 
                : 'bg-emerald-50 border-emerald-300 text-emerald-800';
        case 'personal':
            return isDark 
                ? 'bg-purple-900/30 border-purple-500/50 text-purple-100' 
                : 'bg-purple-50 border-purple-300 text-purple-800';
        default:
            return isDark 
                ? 'bg-gray-700/50 border-gray-500/50 text-gray-100' 
                : 'bg-gray-100 border-gray-300 text-gray-800';
    }
};

// Helper to calculate new end time based on new start time while preserving duration
const calculateNewTimes = (startTime: string, endTime: string, newStartHour: number): { start: string, end: string } => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    // Preserve the minutes from the original start time, only change the hour
    const newStartTotalMinutes = newStartHour * 60 + startM;
    const newEndTotalMinutes = newStartTotalMinutes + durationMinutes;
    
    const formatTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    return {
        start: formatTime(newStartTotalMinutes),
        end: formatTime(newEndTotalMinutes)
    };
};

const checkConflict = (event: CalendarEvent, allEvents: CalendarEvent[]): boolean => {
    return allEvents.some(other => {
        if (other.id === event.id) return false;
        if (other.date !== event.date) return false;
        return (event.startTime < other.endTime && event.endTime > other.startTime);
    });
};

const getEventTimeValues = (event: CalendarEvent) => {
    const [sh, sm] = event.startTime.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    return {
        start: sh + sm / 60,
        end: eh + em / 60
    };
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Filter State
  const [activeFilter, setActiveFilter] = useState<EventCategory | 'all'>('all');

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{start: string, end: string} | undefined>(undefined);

  // Gamification State
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Drag and Drop State
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  // Notification System
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Tools Menu
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Time Indicator State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs for scrolling
  const currentHourRef = useRef<HTMLDivElement | null>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        if (parsedEvents.length === 0) {
          const defaults = generateDefaultTasks(format(new Date(), 'yyyy-MM-dd'));
          setEvents(defaults);
        } else {
          setEvents(parsedEvents);
        }
      } catch (e) {
        setEvents(generateDefaultTasks(format(new Date(), 'yyyy-MM-dd')));
      }
    } else {
      setEvents(generateDefaultTasks(format(new Date(), 'yyyy-MM-dd')));
    }

    const savedPoints = localStorage.getItem(POINTS_KEY);
    if (savedPoints) setPoints(parseInt(savedPoints, 10));

    const savedStreak = localStorage.getItem(STREAK_KEY);
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

    if (lastVisit) {
      const [lvY, lvM, lvD] = lastVisit.split('-').map(Number);
      const lastVisitDate = new Date(lvY, lvM - 1, lvD);
      const daysDiff = differenceInCalendarDays(new Date(), lastVisitDate);
      if (daysDiff === 1) {
        currentStreak += 1;
      } else if (daysDiff > 1) {
        currentStreak = 1;
      }
    } else {
        currentStreak = 1;
    }
    
    setStreak(currentStreak);
    localStorage.setItem(STREAK_KEY, currentStreak.toString());
    localStorage.setItem(LAST_VISIT_KEY, todayStr);

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'dark');
    }

    const timer = setTimeout(() => {
       if (isSameDay(currentDate, new Date()) && currentHourRef.current) {
         currentHourRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(POINTS_KEY, points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Computed Data ---
  const currentDateStr = format(currentDate, 'yyyy-MM-dd');

  const todaysEvents = useMemo(() => {
    return events.filter(event => event.date === currentDateStr);
  }, [events, currentDateStr]);

  const filteredEvents = useMemo(() => {
      if (activeFilter === 'all') return todaysEvents;
      return todaysEvents.filter(e => e.category === activeFilter);
  }, [todaysEvents, activeFilter]);

  const timedEvents = useMemo(() => {
    return filteredEvents.filter(e => !e.isAllDay).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filteredEvents]);

  const progress = useMemo(() => {
    if (todaysEvents.length === 0) return 0;
    const completed = todaysEvents.filter(e => e.isCompleted).length;
    return (completed / todaysEvents.length) * 100;
  }, [todaysEvents]);

  // Determine Active Task
  const activeTask = useMemo(() => {
      const isToday = isSameDay(currentDate, new Date());
      if (!isToday) return null;
      
      const nowStr = format(currentTime, 'HH:mm');
      return timedEvents.find(e => 
          !e.isCompleted && 
          e.startTime <= nowStr && 
          e.endTime > nowStr
      );
  }, [timedEvents, currentDate, currentTime]);

  // --- Toast Handlers ---
  const addToast = (message: string, type: Toast['type'], action?: Toast['action']) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, action }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Action Handlers ---
  const handlePrevDay = () => setCurrentDate(prev => addDays(prev, -1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  
  const scrollToNow = () => {
    if (currentHourRef.current) {
        currentHourRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setTimeout(() => {
        scrollToNow();
    }, 100);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.value) {
        const [y, m, d] = e.target.value.split('-').map(Number);
        setCurrentDate(new Date(y, m - 1, d));
    }
  };

  const handleLoadDefaultRoutine = () => {
    const defaults = generateDefaultTasks(currentDateStr);
    const otherEvents = events.filter(e => e.date !== currentDateStr);
    setEvents([...otherEvents, ...defaults]);
    addToast('Rotina padrão carregada!', 'success');
    setIsToolsOpen(false);
  };

  // Backup & Restore
  const handleExportData = () => {
      const data = {
          events,
          points,
          streak,
          theme: isDarkMode ? 'dark' : 'light',
          exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-planner-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Backup exportado com sucesso!', 'success');
      setIsToolsOpen(false);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              
              if (data.events && Array.isArray(data.events)) {
                  setEvents(data.events);
                  if (data.points !== undefined) setPoints(data.points);
                  if (data.streak !== undefined) setStreak(data.streak);
                  if (data.theme) setIsDarkMode(data.theme === 'dark');
                  
                  addToast('Dados restaurados com sucesso!', 'success');
              } else {
                  throw new Error('Formato inválido');
              }
          } catch (err) {
              addToast('Erro ao importar arquivo. Verifique o formato.', 'error');
          }
      };
      reader.readAsText(file);
      setIsToolsOpen(false);
      // Reset input
      e.target.value = '';
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    const eventWithDate = { ...event, date: currentDateStr };
    
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === event.id ? eventWithDate : e));
      addToast('Evento atualizado!', 'success');
    } else {
      setEvents(prev => [...prev, eventWithDate]);
      addToast('Novo evento criado!', 'success');
    }
    setEditingEvent(undefined);
    setSelectedTimeSlot(undefined);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedTimeSlot(undefined);
    setIsEventModalOpen(true);
  };

  const handleToggleComplete = (id: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const isNowCompleted = !e.isCompleted;
        if (isNowCompleted) {
          setPoints(p => p + 10);
          if (!showConfetti) {
             setShowConfetti(true);
             setTimeout(() => setShowConfetti(false), 2000);
          }
        } else {
          setPoints(p => Math.max(0, p - 10));
        }
        return { ...e, isCompleted: isNowCompleted };
      }
      return e;
    }));
  };

  const handleDeleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    if (!eventToDelete) return;

    // Optimistic delete
    setEvents(prev => prev.filter(e => e.id !== id));
    
    // Add toast with undo
    addToast('Evento excluído.', 'info', {
        label: 'Desfazer',
        onClick: () => {
            setEvents(prev => [...prev, eventToDelete]);
        }
    });
  };

  const handleHourSlotClick = (hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    
    setSelectedTimeSlot({
      start: `${hourStr}:00`,
      end: `${hourStr}:30`
    });
    setEditingEvent(undefined);
    setIsEventModalOpen(true);
  };

  const openNewEventModal = () => {
    setEditingEvent(undefined);
    setSelectedTimeSlot(undefined);
    setIsEventModalOpen(true);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.effectAllowed = 'move';
      setDraggedEventId(id);
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = 'move';
      if (dragOverHour !== hour) {
          setDragOverHour(hour);
      }
  };

  const handleDrop = (e: React.DragEvent, targetHour: number) => {
      e.preventDefault();
      setDragOverHour(null);
      
      if (!draggedEventId) return;

      const eventToMove = events.find(e => e.id === draggedEventId);
      if (eventToMove) {
          const { start, end } = calculateNewTimes(eventToMove.startTime, eventToMove.endTime, targetHour);
          
          setEvents(prev => prev.map(e => 
              e.id === draggedEventId 
              ? { ...e, startTime: start, endTime: end } 
              : e
          ));
          addToast("Evento reagendado.", 'success');
      }
      setDraggedEventId(null);
  };

  // --- Copy Summary Handler ---
  const handleCopySummary = () => {
      const summary = `📅 *Agenda - ${format(currentDate, "d 'de' MMMM", { locale: ptBR })}*\n\n` + 
          todaysEvents
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(e => `${e.isCompleted ? '✅' : '⬜'} *${e.startTime}* - ${e.title} (${e.category})`)
            .join('\n');
      
      navigator.clipboard.writeText(summary).then(() => {
          addToast("Resumo copiado para a área de transferência!", "success");
      });
      setIsToolsOpen(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const isToday = isSameDay(currentDate, new Date());

  const categories: { key: EventCategory | 'all'; label: string; icon: string; color: string }[] = [
      { key: 'all', label: 'Todos', icon: 'fa-list', color: 'bg-gray-200 text-gray-700' },
      { key: 'work', label: 'Trabalho', icon: 'fa-briefcase', color: 'bg-blue-100 text-blue-700' },
      { key: 'health', label: 'Saúde', icon: 'fa-heartbeat', color: 'bg-emerald-100 text-emerald-700' },
      { key: 'personal', label: 'Pessoal', icon: 'fa-user', color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full`}>
      <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImportFile} 
          className="hidden" 
          accept=".json"
      />
      
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-20 flex-shrink-0 relative transition-colors duration-300">
          <div className="container mx-auto max-w-4xl px-4 py-3">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <i className="fas fa-calendar-day text-primary mr-3"></i>
                    Agenda
                  </h1>
                  <div className="flex items-center gap-2">
                     <div className="hidden sm:flex bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold items-center border border-yellow-200 dark:border-yellow-800" title="Pontos totais">
                        <i className="fas fa-star mr-1"></i> {points}
                     </div>
                     <div className="hidden sm:flex bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold items-center border border-orange-200 dark:border-orange-800" title="Dias seguidos">
                        <i className="fas fa-fire mr-1"></i> {streak}
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    title={isDarkMode ? "Modo Claro" : "Modo Noturno"}
                 >
                    <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                 </button>
                <div className="flex items-center space-x-2" title="Progresso do Dia">
                   <ProgressRing radius={22} stroke={3} progress={progress} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700 w-full sm:w-auto justify-between sm:justify-start">
                <button onClick={handlePrevDay} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-primary rounded-md transition-all">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="relative mx-2">
                   <input 
                    type="date" 
                    value={currentDateStr}
                    onChange={handleDateChange}
                    className="bg-transparent border-none text-gray-800 dark:text-white font-medium focus:ring-0 text-center cursor-pointer appearance-none text-sm"
                    style={{ minWidth: '110px', colorScheme: isDarkMode ? 'dark' : 'light' }}
                  />
                </div>
                <button onClick={handleNextDay} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-primary rounded-md transition-all">
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button onClick={handleToday} className="ml-2 px-3 py-1 text-xs font-semibold bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-500 rounded shadow-sm hover:text-primary hover:border-primary transition-all">
                  Hoje
                </button>
              </div>

              <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto items-center">
                <button 
                  onClick={openNewEventModal}
                  className="flex-shrink-0 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow hover:shadow-md transition-all flex items-center justify-center"
                >
                  <i className="fas fa-plus mr-2"></i> <span className="hidden sm:inline">Novo</span>
                </button>
                
                {/* Tools Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setIsToolsOpen(!isToolsOpen)}
                        className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                    {isToolsOpen && (
                        <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsToolsOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 text-sm animate-fade-in-up">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ações</div>
                            <button onClick={handleLoadDefaultRoutine} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center">
                                <i className="fas fa-clipboard-list mr-2 text-emerald-500 w-5"></i> Rotina Padrão
                            </button>
                            <button onClick={handleCopySummary} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center">
                                <i className="fas fa-copy mr-2 text-blue-500 w-5"></i> Copiar Resumo
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Dados</div>
                            <button onClick={handleExportData} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center">
                                <i className="fas fa-file-export mr-2 text-purple-500 w-5"></i> Exportar Backup
                            </button>
                            <button onClick={handleImportClick} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center">
                                <i className="fas fa-file-import mr-2 text-orange-500 w-5"></i> Importar Backup
                            </button>
                        </div>
                        </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ACTIVE TASK BANNER - Focus Mode */}
        {activeTask && (
             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 shadow-md relative z-10 animate-fade-in-up">
                <div className="container mx-auto max-w-4xl flex justify-between items-center">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white/20 p-2 rounded-full animate-pulse">
                            <i className="fas fa-clock text-white"></i>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Acontecendo Agora</span>
                            <span className="font-semibold truncate">{activeTask.title}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggleComplete(activeTask.id)}
                        className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-full text-sm font-bold shadow transition-all whitespace-nowrap ml-4"
                    >
                        Concluir <i className="fas fa-check ml-1"></i>
                    </button>
                </div>
             </div>
        )}
        
        {/* Category Filter Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 shadow-sm z-10 overflow-x-auto">
            <div className="container mx-auto max-w-4xl flex space-x-2">
                {categories.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveFilter(cat.key as EventCategory | 'all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center transition-all ${
                            activeFilter === cat.key 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        <i className={`fas ${cat.icon} mr-1.5 ${activeFilter === cat.key ? 'text-white' : 'text-gray-400 dark:text-gray-400'}`}></i>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        <main className="flex-1 overflow-y-auto container mx-auto max-w-4xl p-4 space-y-4 pb-20">
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative transition-colors duration-300">
             <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-4 py-2 flex justify-between sticky top-0 z-10">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Hora</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Compromissos</span>
             </div>
             
             <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] dark:bg-none relative">
               
               {/* Global Time Line for Visual Continuity */}
               {isToday && (
                  <div 
                    className="absolute w-full border-t-2 border-red-500 dark:border-red-400 pointer-events-none z-0"
                    style={{ 
                        top: `${(currentHour * 80) + (currentMinute / 60 * 80)}px`, 
                        display: 'none'
                    }} 
                  ></div>
               )}

               {hours.map(hour => {
                 const hourStr = hour.toString().padStart(2, '0');
                 const isCurrentHour = isToday && hour === currentHour;
                 
                 // Filter Logic Updated: Check if event overlaps this hour
                 const hourEvents = timedEvents.filter(e => {
                     const { start, end } = getEventTimeValues(e);
                     // Event starts before this slot ends, and ends after this slot starts
                     return start < (hour + 1) && end > hour;
                 });
                 
                 const isDragOver = dragOverHour === hour;

                 return (
                   <div 
                      key={hour} 
                      ref={isCurrentHour ? currentHourRef : null}
                      onDragOver={(e) => handleDragOver(e, hour)}
                      onDrop={(e) => handleDrop(e, hour)}
                      className={`flex min-h-[80px] group transition-colors duration-200 relative
                          ${isDragOver ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-inset ring-primary' : ''}
                          ${!isDragOver && isCurrentHour ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                          ${!isDragOver && !isCurrentHour ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30' : ''}
                      `}
                   >
                     <div className="w-16 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 p-2 text-right relative">
                       <span className={`text-xs font-semibold ${isCurrentHour ? 'text-primary dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>{hourStr}:00</span>
                     </div>
                     
                     <div 
                       role="button"
                       tabIndex={0}
                       aria-label={`Agendar evento para as ${hourStr}:00`}
                       className="flex-1 p-2 relative cursor-pointer focus:outline-none focus:bg-indigo-50 dark:focus:bg-gray-700"
                       onClick={(e) => {
                         if(e.target === e.currentTarget) handleHourSlotClick(hour);
                       }}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           e.preventDefault();
                           handleHourSlotClick(hour);
                         }
                       }}
                     >
                       <div className="absolute top-1/2 left-0 w-full border-t border-dotted border-gray-100 dark:border-gray-700 pointer-events-none"></div>
                       
                       {isCurrentHour && (
                         <div 
                           className="absolute left-0 w-full flex items-center pointer-events-none z-20"
                           style={{ top: `${(currentMinute / 60) * 100}%` }}
                           title="Agora"
                         >
                           <div className="w-16 -ml-16 pr-2 text-right text-[10px] font-bold text-red-500 dark:text-red-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                {format(currentTime, 'HH:mm')}
                           </div>
                           <div className="w-full border-t-2 border-red-500 dark:border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                         </div>
                       )}
                       
                       <div className="space-y-1 relative z-10">
                           {hourEvents.map(event => {
                             const hasConflict = checkConflict(event, hourEvents);
                             const { start } = getEventTimeValues(event);
                             const isStartOfEvent = Math.floor(start) === hour;

                             return (
                               <div 
                                  key={event.id} 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, event.id)}
                                  onClick={(e) => { e.stopPropagation(); }}
                                  className={`relative flex items-center p-2 border-l-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing 
                                      ${getCategoryColor(event.category, event.isCompleted, isDarkMode, hasConflict && !event.isCompleted)}
                                      ${draggedEventId === event.id ? 'opacity-50 scale-95' : ''}
                                      ${isStartOfEvent ? 'rounded-md' : 'rounded-t-none rounded-b-md border-t-0 -mt-2.5 opacity-80 pt-3 z-0'}
                                  `}
                               >
                                 <div className="mr-2 text-gray-300 dark:text-gray-600 cursor-grab opacity-50 hover:opacity-100" aria-hidden="true">
                                     <i className="fas fa-grip-vertical text-[10px]"></i>
                                 </div>
                                 
                                 {isStartOfEvent ? (
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleComplete(event.id); }}
                                        className={`flex-shrink-0 w-4 h-4 rounded-full border mr-3 flex items-center justify-center transition-colors ${event.isCompleted ? 'bg-green-500 border-green-500' : 'bg-transparent border-current hover:bg-black/10'}`}
                                        aria-label={event.isCompleted ? "Marcar como não concluído" : "Marcar como concluído"}
                                     >
                                       {event.isCompleted && <i className="fas fa-check text-white text-[10px]"></i>}
                                     </button>
                                 ) : (
                                     <div className="w-4 mr-3"></div> // Spacer for alignment
                                 )}
                                 
                                 <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEditEvent(event)}>
                                   <div className="flex justify-between items-baseline">
                                     <h4 className={`text-sm font-semibold truncate ${event.isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-inherit'} ${!isStartOfEvent ? 'opacity-70' : ''}`}>
                                       {event.title} { !isStartOfEvent && '(Continuação)' }
                                     </h4>
                                     {isStartOfEvent && (
                                         <span className="text-xs opacity-80 font-mono ml-2 whitespace-nowrap">
                                            {event.startTime} - {event.endTime}
                                         </span>
                                     )}
                                   </div>
                                   {isStartOfEvent && event.description && <p className="text-xs opacity-70 truncate mt-0.5">{event.description}</p>}
                                   {hasConflict && !event.isCompleted && isStartOfEvent && (
                                      <div className="text-[10px] text-red-600 dark:text-red-300 flex items-center mt-1 font-bold">
                                        <i className="fas fa-exclamation-triangle mr-1"></i> Conflito de horário
                                      </div>
                                   )}
                                 </div>

                                 {isStartOfEvent && (
                                     <div className="ml-2 flex flex-col sm:flex-row gap-1">
                                       <button onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }} className="opacity-60 hover:opacity-100 transition-opacity p-1" aria-label="Editar">
                                          <i className="fas fa-pen text-xs"></i>
                                       </button>
                                       <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity p-1" aria-label="Excluir">
                                          <i className="fas fa-times text-xs"></i>
                                       </button>
                                     </div>
                                 )}
                               </div>
                             );
                           })}
                       </div>

                       <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleHourSlotClick(hour); }}
                            className="w-6 h-6 bg-gray-100 dark:bg-gray-600 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-400 dark:text-gray-300 transition-all shadow-sm"
                            title={`Adicionar às ${hourStr}:00`}
                          >
                            <i className="fas fa-plus text-xs"></i>
                          </button>
                       </div>
                     </div>
                   </div>
                 );
               })}
               
               {filteredEvents.length === 0 && (
                   <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                       <i className="fas fa-calendar-times text-4xl mb-3"></i>
                       <p>Nenhum evento encontrado {activeFilter !== 'all' ? `na categoria ${categories.find(c => c.key === activeFilter)?.label}` : 'para hoje'}.</p>
                   </div>
               )}
             </div>
          </section>

        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0 z-20 transition-colors duration-300">
           <div className="container mx-auto max-w-4xl flex justify-center space-x-4">
              <button 
                onClick={scrollToNow}
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 font-medium text-sm flex items-center transition-colors"
                title="Rolar para o horário atual"
              >
                 <i className="fas fa-crosshairs mr-2"></i> Focar no Agora
              </button>
           </div>
        </footer>

        <EventModal 
          isOpen={isEventModalOpen} 
          onClose={() => { setIsEventModalOpen(false); setEditingEvent(undefined); setSelectedTimeSlot(undefined); }} 
          onSave={handleSaveEvent}
          initialDate={currentDateStr}
          initialStartTime={selectedTimeSlot?.start}
          initialEndTime={selectedTimeSlot?.end}
          eventToEdit={editingEvent}
        />
        
        <ToastNotification toasts={toasts} onDismiss={removeToast} />

        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
             <div className="animate-bounce text-6xl">🎉</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
