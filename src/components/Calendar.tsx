import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTaskContext } from '../context/TaskContext';
import { Plus, X } from 'lucide-react';

const locales = {
  'ja': ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export function Calendar() {
  const { events, addEvent, removeEvent } = useTaskContext();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  
  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setTitle('');
    setDescription('');
    setDurationMinutes(30);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    if (window.confirm(`「${event.title}」を削除しますか？`)) {
      removeEvent(event.id);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const end = new Date(selectedDate.getTime() + durationMinutes * 60000);
    addEvent({
      id: crypto.randomUUID(),
      title,
      start: selectedDate,
      end,
      details: description,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-soft p-4 sm:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">学習カレンダー</h2>
      </div>
      
      <div className="flex-1 min-h-[500px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          view={view}
          date={date}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setDate(newDate)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "次",
            previous: "前",
            today: "今日",
            month: "月",
            week: "週",
            day: "日",
          }}
          culture="ja"
          className="text-sm font-sans"
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-slide-up">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">予定の追加</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  開始日時表示
                </label>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 font-medium">
                  {format(selectedDate, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：数学の復習"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ikea-blue focus:border-ikea-blue outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">
                  予定時間（分）
                </label>
                <input
                  type="number"
                  id="duration"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min="5"
                  step="5"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ikea-blue focus:border-ikea-blue outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  詳細（任意）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="学習内容や目標など"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ikea-blue focus:border-ikea-blue outline-none transition-all resize-none min-h-[80px]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-ikea-blue text-white rounded-xl font-bold text-lg hover:bg-ikea-blue/90 hover:scale-[0.98] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  <span>予定を追加</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
