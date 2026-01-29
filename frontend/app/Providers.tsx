'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, User } from '@/lib/api';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
};

export type ToastItem = NotificationItem;

type AppContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
  notifications: NotificationItem[];
  toasts: ToastItem[];
  pushNotification: (
    n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ) => void;
  removeNotification: (id: string) => void;
  removeToast: (id: string) => void;
  clearNotifications: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <Providers />');
  return ctx;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [subscriptions, setSubscriptions] = useState<number[]>([]);
  const subsRef = React.useRef<number[]>([]);

  // Keep ref in sync
  useEffect(() => {
    subsRef.current = subscriptions;
  }, [subscriptions]);

  // Load session on mount
  useEffect(() => {
    const u = api.getCurrentUser();
    if (u) setUser(u);
  }, []);

  // Load subscriptions for company
  useEffect(() => {
    if (user?.role === 'company') {
      api.getSubscriptions().then(subs => {
        const ids = subs.map((s: any) => s.category_id);
        setSubscriptions(ids);
      }).catch(console.error);
    }
  }, [user]);

  // Push banner notification
  const pushNotification: AppContextValue['pushNotification'] = (n) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const newItem = { id, timestamp, read: false, ...n };

    // Add to history
    setNotifications((prev) => [newItem, ...prev].slice(0, 10)); // Keep last 10

    // Add to toasts
    setToasts((prev) => [newItem, ...prev].slice(0, 3)); // Max 3 toasts at once

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((x) => x.id !== id)
    );
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // 📡 REAL-TIME WEBSOCKET LISTENER
  useEffect(() => {
    if (!user) return;

    // Connect to backend WS server
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8082';
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to Notification Server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WS Message:', data);

          // 1. New Request -> Notify all Companies (matching category)
          if (data.type === 'rfq.created' && user.role === 'company') {
            // Use ref to get latest subscriptions
            const catId = Number(data.categoryId);
            if (subsRef.current.includes(catId)) {
              pushNotification({
                title: 'New RFQ Opportunity',
                message: `New request: ${data.title} (${data.category})`,
              });
            }
          }

          // 2. New Quotation -> Notify RFQ Owner
          if (data.type === 'quotation.created' && user.role === 'user') {
            if (data.rfqOwnerId === user.id) {
              pushNotification({
                title: 'New Quotation Received',
                message: `You received a quote from ${data.company} for "${data.rfqTitle}"`,
              });
            }
          }

          // 3. Quotation Accepted -> Notify Company
          if (data.type === 'quotation.accepted' && user.role === 'company') {
            pushNotification({
              title: 'Quotation Status Update',
              message: data.message,
            });
          }
        } catch (e) {
          console.error('WS Parse Error', e);
        }
      };

      ws.onclose = () => {
        console.log('WS Disconnected. Reconnecting in 3s...');
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (e) => {
        console.error('WebSocket Error. Ensure backend server is running on port 8082.');
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      notifications,
      toasts,
      pushNotification,
      removeNotification,
      removeToast,
      clearNotifications,
    }),
    [user, notifications, toasts]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
