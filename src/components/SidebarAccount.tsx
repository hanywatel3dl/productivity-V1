import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useSync } from '../context/SyncProvider';
import { motion, AnimatePresence } from 'framer-motion';

export function SidebarAccount({ isCollapsed }) {
  const { user, signOut } = useAuth();
  const { syncing, lastSyncedAt, triggerSync, syncError } = useSync();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isCollapsed) {
      setOpen(false);
    }
  }, [isCollapsed]);

  const name = user?.user_metadata?.full_name || user?.email || 'زائر';
  const avatar = user?.user_metadata?.avatar_url;

  // --== التعديل الأول: إضافة radius=10 لجعل شكل الأيقونة مربعًا بحواف دائرية أنيقة ==--
  const avatarUrl = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&radius=10`;

  return (
    <div className="mt-auto">
      <div className="relative">
        <button
          onClick={() => !isCollapsed && setOpen((s) => !s)}
          className={`w-full flex items-center p-3 rounded-lg text-white transition-colors hover:bg-[#3D2B79]/70
            ${isCollapsed ? 'justify-center' : 'gap-3'}`}
          title={isCollapsed ? name : undefined}
        >
          <img 
            src={avatarUrl} 
            // --== التعديل الثاني: تغيير rounded-full إلى rounded-lg لتناسق التصميم ==--
            className="w-8 h-8 rounded-lg flex-shrink-0" 
            alt="avatar" 
          />

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2, ease: "easeInOut" } }}
                exit={{ opacity: 0, width: 0, transition: { duration: 0.15 } }}
                className="text-right overflow-hidden whitespace-nowrap"
              >
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-white/60">
                  {syncing 
                    ? 'جاري المزامنة…' 
                    : lastSyncedAt 
                    ? `آخر مزامنة: ${new Date(lastSyncedAt).toLocaleTimeString()}` 
                    : 'غير مُزامن'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {open && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={{ opacity: 0, transform: 'translateY(10px)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute bottom-14 right-0 w-64 bg-[#22144f] border border-white/10 rounded-xl overflow-hidden shadow-xl"
            >
              <button onClick={() => triggerSync()} className="w-full text-right px-4 py-3 hover:bg-white/5 text-white">مزامنة الآن</button>
              {syncError && <div className="px-4 py-2 text-xs text-red-300">فشل في المزامنة: {syncError}</div>}
              {user ? (
                <button onClick={() => signOut()} className="w-full text-right px-4 py-3 hover:bg-white/5 text-red-400">تسجيل الخروج</button>
              ) : (
                <a href="#/login" className="block w-full text-right px-4 py-3 hover:bg-white/5 text-amber-300">تسجيل الدخول / إنشاء حساب</a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}