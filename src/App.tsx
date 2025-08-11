import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { AuthProvider } from './context/AuthProvider';
import { SyncProvider } from './context/SyncProvider';
import LoginPage from './pages/Login';
import { Calendar } from './components/Calendar';
import { PrayerTimesView } from './components/prayers/PrayerTimesView';
import { QuranProgress } from './components/quran/QuranProgress';
import { QuranReader } from './components/quran/QuranReader';
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer';
import { TaskList } from './components/tasks/TaskList';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { JournalView } from './components/journal/JournalView';
import { NotesView } from './components/notes/NotesView';
import { HabitsView } from './components/habits/HabitsView';
import { EnhancedRemindersView } from './components/reminders/EnhancedRemindersView';
import { AudioPlayerToggle } from './components/pomodoro/AudioPlayerToggle';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Menu } from 'lucide-react';

function AppShell() {
  const [activePath, setActivePath] = useState('recovery');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const handleNavigate = (path: string) => {
    setActivePath(path);
    if (!isDesktop) {
      setIsMobileNavOpen(false);
    }
  };

  useEffect(() => {
    if (isDesktop) {
      setIsMobileNavOpen(false);
    } else {
      setIsCollapsed(true);
    }
  }, [isDesktop]);

  return (
    <div className="flex min-h-screen bg-[#1A0F3C]">
      <Sidebar 
        isCollapsed={isDesktop ? isCollapsed : true}
        setIsCollapsed={setIsCollapsed} 
        activePath={activePath} 
        onNavigate={handleNavigate}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        isDesktop={isDesktop}
      />
      
      <main 
        className="flex-1 p-4 sm:p-8 overflow-y-auto transition-all duration-300 ease-in-out"
        style={{
          marginRight: isDesktop ? (isCollapsed ? '80px' : '260px') : '0'
        }}
      >
        {!isDesktop && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 bg-[#2D1B69]/50 backdrop-blur-md rounded-md text-white"
            >
              <Menu size={24} />
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePath}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activePath === 'recovery' && <Calendar />}
            {activePath === 'prayers' && <PrayerTimesView />}
            {activePath === 'quran' && (
              <QuranReader onShowProgress={() => setActivePath('quran-progress')} />
            )}
            {activePath === 'quran-progress' && (
              <QuranProgress onBack={() => setActivePath('quran')} />
            )}
            {activePath === 'journal' && <JournalView />}
            {activePath === 'notes' && <NotesView />}
            {activePath === 'tasks' && <TaskList />}
            {activePath === 'habits' && <HabitsView />}
            {activePath === 'reminders' && <EnhancedRemindersView />}
            {activePath === 'pomodoro' && <PomodoroTimer />}
            {activePath === 'analytics' && <AnalyticsView />}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* 
        *** هذا هو التعديل الوحيد والمطلوب ***
        الآن، AudioPlayerToggle سيظهر فقط عندما يكون activePath هو 'pomodoro'.
      */}
      {activePath === 'pomodoro' && <AudioPlayerToggle />}
    </div>
  );
}

function RouterGate({ children }: { children: React.ReactNode }) {
  const [hash, setHash] = useState<string>(typeof window !== 'undefined' ? window.location.hash : '');
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    // Ensure state is in sync on mount
    setHash(window.location.hash);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  if (hash === '#/login') return <LoginPage />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <RouterGate>
          <AppShell />
        </RouterGate>
      </SyncProvider>
    </AuthProvider>
  );
}