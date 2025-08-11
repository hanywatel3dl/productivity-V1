import { useState } from 'react';
import { SidebarAccount } from './SidebarAccount';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Book, CheckSquare, Timer, BarChart2,
  PenLine, BookOpen, ListChecks, Bell, PanelLeft, X
} from 'lucide-react';

const menuItems = [
  { icon: Calendar, label: 'تقدم التعافي', path: 'recovery' },
  { icon: Clock, label: 'أوقات الصلاة', path: 'prayers' },
  { icon: Book, label: 'ورد القرآن', path: 'quran' },
  { icon: BookOpen, label: 'اليوميات', path: 'journal' },
  { icon: PenLine, label: 'الملاحظات', path: 'notes' },
  { icon: CheckSquare, label: 'المهام', path: 'tasks' },
  { icon: ListChecks, label: 'العادات', path: 'habits' },
  { icon: Bell, label: 'التذكيرات', path: 'reminders' },
  { icon: Timer, label: 'بومودورو', path: 'pomodoro' },
  { icon: BarChart2, label: 'التحليلات', path: 'analytics' },
];

const desktopSidebarVariants = {
  expanded: {
    width: 260,
    transition: { type: "spring", stiffness: 150, damping: 22 },
  },
  collapsed: {
    width: 80,
    transition: { type: "spring", stiffness: 150, damping: 22 },
  },
};

const mobileSidebarVariants = {
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  closed: {
    x: '100%', // Move off-screen to the right for RTL
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const backdropVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

const navItemsContainerVariants = {
  expanded: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  collapsed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const navItemVariants = {
  expanded: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  collapsed: { y: 20, opacity: 0, transition: { duration: 0.2 } },
};

const SidebarContent = ({ isCollapsed, activePath, onNavigate }) => (
  <>
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
      className="border-t border-white/10"
    />
    <motion.nav
      variants={navItemsContainerVariants}
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className="flex-1 flex flex-col gap-2 overflow-y-auto"
    >
      {menuItems.map((item) => (
        <motion.div key={item.path} variants={navItemVariants}>
          <button
            onClick={() => onNavigate(item.path)}
            className={`flex items-center p-3 rounded-lg transition-colors w-full
              ${isCollapsed ? 'justify-center' : 'gap-3'}
              ${activePath === item.path
                ? 'bg-[#3D2B79] text-amber-400'
                : 'text-white hover:bg-[#3D2B79]/70'
              }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <motion.span
              animate={{
                width: isCollapsed ? 0 : 'auto',
                opacity: isCollapsed ? 0 : 1
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="whitespace-nowrap overflow-hidden font-tajawal"
            >
              {item.label}
            </motion.span>
          </button>
        </motion.div>
      ))}
    </motion.nav>
    <SidebarAccount isCollapsed={isCollapsed} />
  </>
);

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  activePath,
  onNavigate,
  isMobileNavOpen,
  setIsMobileNavOpen,
  isDesktop
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.div
      variants={desktopSidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial="expanded"
      className="fixed top-0 right-0 h-screen z-50 bg-[#2D1B69]/50 backdrop-blur-xl p-4 flex-col gap-y-4 hidden lg:flex"
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src="https://i.ibb.co/h1Y0Nx36/image-9.png"
                alt="Logo"
                className="w-8 h-8 flex-shrink-0 cursor-pointer"
                onClick={() => onNavigate('recovery')}
              />
              <span className="pt-1 text-lg font-bold text-white whitespace-nowrap">
                ـ+ـالإنتاجية
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.15, backgroundColor: '#3D2B79' }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-md text-white/80 hover:text-white transition-colors"
          aria-label="Toggle Sidebar"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed && !isHovered ? (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <img src="https://i.ibb.co/h1Y0Nx36/image-9.png" alt="Logo" className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div
                key="panel"
                initial={{ opacity: 0, scale: 0.5, rotate: isCollapsed ? 180 : 0 }}
                animate={{ opacity: 1, scale: 1, rotate: isCollapsed ? 180 : 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <PanelLeft className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <SidebarContent isCollapsed={isCollapsed} activePath={activePath} onNavigate={onNavigate} />
    </motion.div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileNavOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          <motion.div
            variants={mobileSidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 h-screen w-3/4 max-w-sm z-50 bg-[#2D1B69]/80 backdrop-blur-xl p-4 flex flex-col gap-y-4 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="pt-1 text-lg font-bold text-white whitespace-nowrap">
                ـ+ـالإنتاجية
              </span>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1.5 rounded-md text-white/80 hover:text-white"
              >
                <X />
              </button>
            </div>
            <SidebarContent isCollapsed={false} activePath={activePath} onNavigate={onNavigate} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return isDesktop ? <DesktopSidebar /> : <MobileSidebar />;
};