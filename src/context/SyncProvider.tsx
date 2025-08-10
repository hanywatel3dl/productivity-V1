import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store';
import { useHabitStore } from '../store/habitStore';
import { useReminderStore } from '../store/reminderStore';
import { useAuth } from './AuthProvider';

type SyncContextValue = {
  lastSyncedAt: string | null;
  syncing: boolean;
  triggerSync: (force?: boolean) => Promise<void>;
  syncError: string | null;
};

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

// A single JSON blob per user. Merge strategy: prefer remote if newer, else push local.
function buildLocalSnapshot() {
  const app = useStore.getState();
  const habits = useHabitStore.getState();
  const reminders = useReminderStore.getState();
  const snapshot = {
    version: 1,
    updated_at: new Date().toISOString(),
    app: {
      calendar: app.calendar,
      prayers: app.prayers,
      quranProgress: app.quranProgress,
      tasks: app.tasks,
      notes: app.notes,
      focusSessions: app.focusSessions,
    },
    habits: {
      habits: habits.habits,
      habitLogs: habits.habitLogs,
    },
    reminders: {
      reminders: reminders.reminders,
      viewMode: reminders.viewMode,
      timelineZoom: reminders.timelineZoom,
      visibleCategories: reminders.visibleCategories,
      selectedDate: reminders.selectedDate?.toISOString?.() ?? new Date().toISOString(),
      lastUpdateTime: reminders.lastUpdateTime,
    },
  };
  return snapshot;
}

function applySnapshotToLocal(snapshot: any) {
  const app = useStore.getState();
  useStore.setState({
    calendar: snapshot.app.calendar ?? app.calendar,
    prayers: snapshot.app.prayers ?? app.prayers,
    quranProgress: snapshot.app.quranProgress ?? app.quranProgress,
    tasks: snapshot.app.tasks ?? app.tasks,
    notes: snapshot.app.notes ?? app.notes,
    focusSessions: snapshot.app.focusSessions ?? app.focusSessions,
  });

  const habit = useHabitStore.getState();
  useHabitStore.setState({
    habits: snapshot.habits.habits ?? habit.habits,
    habitLogs: snapshot.habits.habitLogs ?? habit.habitLogs,
  });

  const reminder = useReminderStore.getState();
  useReminderStore.setState({
    reminders: snapshot.reminders.reminders ?? reminder.reminders,
    viewMode: snapshot.reminders.viewMode ?? reminder.viewMode,
    timelineZoom: snapshot.reminders.timelineZoom ?? reminder.timelineZoom,
    visibleCategories: snapshot.reminders.visibleCategories ?? reminder.visibleCategories,
    selectedDate: snapshot.reminders.selectedDate ? new Date(snapshot.reminders.selectedDate) : reminder.selectedDate,
    lastUpdateTime: snapshot.reminders.lastUpdateTime ?? reminder.lastUpdateTime,
  });
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncInFlight = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const lastSyncedSnapshotStr = useRef<string | null>(null);
  const lastSyncTimeMs = useRef<number>(0);
  const rateLimitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPush = useRef<boolean>(false);
  const periodicPullTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const suppressLocalPush = useRef<boolean>(false);
  const lastAppliedSnapshotStr = useRef<string | null>(null);

  const DEBOUNCE_MS = 180; // near real-time coalescing
  const MIN_SYNC_INTERVAL_MS = 0; // allow immediate successive pushes
  const PERIODIC_PULL_MS = 60000; // pull remote every 60s to catch other devices

  const upsertRemote = async (snapshot: any) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_data')
      .upsert({ user_id: user.id, data: snapshot, updated_at: snapshot.updated_at });
    if (error) {
      setSyncError(error.message);
      // eslint-disable-next-line no-console
      console.warn('Cloud sync upsert failed:', error);
      throw error;
    } else {
      setSyncError(null);
    }
  };

  const fetchRemote = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      setSyncError(error.message);
      // eslint-disable-next-line no-console
      console.warn('Cloud sync fetch failed:', error);
      return null;
    }
    setSyncError(null);
    return data as { user_id: string; data: any; updated_at: string } | null;
  };

  const pushLocal = async (force: boolean) => {
    if (!user) return;
    const now = Date.now();
    // No global rate limit; rely on hash-diff & small debounce

    const local = buildLocalSnapshot();
    const snapshotStr = JSON.stringify(local);
    if (!force && lastSyncedSnapshotStr.current === snapshotStr) {
      return; // nothing changed
    }
    setSyncing(true);
    try {
      await upsertRemote(local);
      lastSyncedSnapshotStr.current = snapshotStr;
      lastSyncTimeMs.current = Date.now();
      setLastSyncedAt(local.updated_at);
    } finally {
      setSyncing(false);
    }
  };

  const pullRemoteAndMerge = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const remote = await fetchRemote();
      if (remote?.data) {
        const incomingStr = JSON.stringify(remote.data);
        if (
          incomingStr !== lastSyncedSnapshotStr.current &&
          incomingStr !== lastAppliedSnapshotStr.current
        ) {
          suppressLocalPush.current = true;
          applySnapshotToLocal(remote.data);
          lastAppliedSnapshotStr.current = incomingStr;
          setTimeout(() => {
            suppressLocalPush.current = false;
          }, 0);
        }
        lastSyncedSnapshotStr.current = incomingStr;
        setLastSyncedAt(remote.updated_at);
        lastSyncTimeMs.current = Date.now();
      }
    } finally {
      setSyncing(false);
    }
  };

  const triggerSync = async (force = false) => {
    if (!user) return;
    if (syncInFlight.current && !force) return;
    syncInFlight.current = true;
    try {
      if (force) {
        await pullRemoteAndMerge();
        await pushLocal(true);
      } else {
        await pushLocal(false);
      }
    } finally {
      syncInFlight.current = false;
    }
  };

  // Sync on login
  useEffect(() => {
    if (user) {
      // Initial two-way sync
      void (async () => {
        await pullRemoteAndMerge();
        await pushLocal(true);
      })();
      // Periodic pull to catch multi-device edits
      if (periodicPullTimer.current) clearInterval(periodicPullTimer.current);
      periodicPullTimer.current = setInterval(() => {
        void pullRemoteAndMerge();
      }, PERIODIC_PULL_MS);
    }
    return () => {
      if (periodicPullTimer.current) clearInterval(periodicPullTimer.current);
    };
  }, [user]);

  // Realtime apply when remote user_data changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('user_data_sync_' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${user.id}` }, (payload) => {
        const row: any = (payload as any).new;
        if (row?.data) {
          const incomingStr = JSON.stringify(row.data);
          if (
            incomingStr === lastSyncedSnapshotStr.current ||
            incomingStr === lastAppliedSnapshotStr.current
          ) {
            return; // ignore echo/no-op
          }
          suppressLocalPush.current = true;
          applySnapshotToLocal(row.data);
          lastAppliedSnapshotStr.current = incomingStr;
          setLastSyncedAt(row.updated_at ?? new Date().toISOString());
          setTimeout(() => {
            suppressLocalPush.current = false;
          }, 0);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auto-sync on local changes (light debounce)
  useEffect(() => {
    if (!user) return;
    const schedule = () => {
      if (suppressLocalPush.current) return; // ignore updates coming from remote apply
      pendingPush.current = true;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (pendingPush.current) {
          pendingPush.current = false;
          void triggerSync();
        }
      }, DEBOUNCE_MS);
    };
    const unsubApp = useStore.subscribe(schedule);
    const unsubHabit = useHabitStore.subscribe(schedule);
    const unsubRem = useReminderStore.subscribe(schedule);
    return () => {
      unsubApp();
      unsubHabit();
      unsubRem();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [user]);

  // Try to flush before unload
  useEffect(() => {
    if (!user) return;
    const beforeUnload = () => {
      // Fire and forget
      triggerSync();
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [user]);

  const value = useMemo<SyncContextValue>(() => ({ lastSyncedAt, syncing, triggerSync, syncError }), [lastSyncedAt, syncing, syncError]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}


