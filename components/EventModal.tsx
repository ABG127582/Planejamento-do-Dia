
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventCategory } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  initialDate: string;
  initialStartTime?: string;
  initialEndTime?: string;
  eventToEdit?: CalendarEvent;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialDate,
  initialStartTime = '09:00',
  initialEndTime = '10:00',
  eventToEdit
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('other');
  const [id, setId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (eventToEdit) {
        setId(eventToEdit.id);
        setTitle(eventToEdit.title);
        setStartTime(eventToEdit.startTime);
        setEndTime(eventToEdit.endTime);
        setDescription(eventToEdit.description || '');
        setCategory(eventToEdit.category || 'other');
      } else {
        setId(null);
        setTitle('');
        setStartTime(initialStartTime);
        setEndTime(initialEndTime);
        setDescription('');
        setCategory('work'); // Default for new events
      }
    }
  }, [isOpen, eventToEdit, initialStartTime, initialEndTime]);

  if (!isOpen) return null;

  const validateTime = (start: string, end: string) => {
    if (start >= end) {
      return "O horário de término deve ser posterior ao horário de início.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateTime(startTime, endTime);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newEvent: CalendarEvent = {
      id: id || crypto.randomUUID(),
      title,
      startTime,
      endTime,
      isAllDay: false, // Force all events to be timed
      description,
      isCompleted: eventToEdit ? eventToEdit.isCompleted : false,
      date: initialDate,
      category,
    };
    onSave(newEvent);
    onClose();
  };

  const categories: { value: EventCategory; label: string; color: string }[] = [
    { value: 'work', label: 'Trabalho/Foco', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'health', label: 'Saúde/Bem-estar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'personal', label: 'Pessoal', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up transition-colors duration-200">
        <div className="bg-primary px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold">
            <i className={`fas ${eventToEdit ? 'fa-edit' : 'fa-calendar-plus'} mr-2`}></i> 
            {eventToEdit ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Ex: Reunião de equipe"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
                className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none`}
                style={{ colorScheme: 'dark' }} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none`}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
             <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all flex items-center justify-center ${
                      category === cat.value 
                        ? `${cat.color} ring-2 ring-offset-1 ring-primary dark:ring-offset-gray-800` 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                     <span className={`w-2 h-2 rounded-full mr-2 ${
                       cat.value === 'work' ? 'bg-blue-500' : 
                       cat.value === 'health' ? 'bg-emerald-500' : 
                       cat.value === 'personal' ? 'bg-purple-500' : 'bg-gray-500'
                     }`}></span>
                     {cat.label}
                  </button>
                ))}
             </div>
          </div>
          
          {error && (
            <div className="text-xs text-red-500 flex items-center mt-1 animate-pulse">
              <i className="fas fa-exclamation-circle mr-1"></i> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="Detalhes adicionais..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
