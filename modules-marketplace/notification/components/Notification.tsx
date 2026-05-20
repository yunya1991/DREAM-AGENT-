import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2, AlertCircle, AlertTriangle, Info,
  X, Bell,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: NotificationAction;
  createdAt: number;
}

interface NotificationProps {
  position?: NotificationPosition;
  maxVisible?: number;
  defaultDuration?: number;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────
const ICON_MAP: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const COLOR_MAP: Record<NotificationType, { bg: string; icon: string; border: string; progress: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    progress: 'bg-blue-500',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    progress: 'bg-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    progress: 'bg-yellow-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    progress: 'bg-red-500',
  },
};

const POSITION_MAP: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

// ─── Notification Store (Singleton) ───────────────────────────
let notifyIdCounter = 0;
let listeners: Array<(items: NotificationItem[]) => void> = [];
let notificationItems: NotificationItem[] = [];

function dispatch() {
  listeners.forEach((fn) => fn([...notificationItems]));
}

export const notify = {
  info: (title: string, opts?: { message?: string; duration?: number; action?: NotificationAction }) => {
    add({ type: 'info', title, ...opts });
  },
  success: (title: string, opts?: { message?: string; duration?: number; action?: NotificationAction }) => {
    add({ type: 'success', title, ...opts });
  },
  warning: (title: string, opts?: { message?: string; duration?: number; action?: NotificationAction }) => {
    add({ type: 'warning', title, ...opts });
  },
  error: (title: string, opts?: { message?: string; duration?: number; action?: NotificationAction }) => {
    add({ type: 'error', title, ...opts });
  },
  dismiss: (id: string) => {
    remove(id);
  },
  dismissAll: () => {
    notificationItems = [];
    dispatch();
  },
};

function add(item: Omit<NotificationItem, 'id' | 'createdAt'>) {
  const id = `notif-${++notifyIdCounter}`;
  notificationItems.push({ ...item, id, createdAt: Date.now() });
  dispatch();
  return id;
}

function remove(id: string) {
  notificationItems = notificationItems.filter((n) => n.id !== id);
  dispatch();
}

function subscribe(fn: (items: NotificationItem[]) => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

// ─── Single Notification Toast ────────────────────────────────
interface ToastProps {
  item: NotificationItem;
  defaultDuration: number;
  onDismiss: (id: string) => void;
}

function Toast({ item, defaultDuration, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const colors = COLOR_MAP[item.type];
  const Icon = ICON_MAP[item.type];
  const duration = item.duration ?? defaultDuration;

  useEffect(() => {
    if (duration === 0) return;
    const step = 50;
    const decrement = (step / duration) * 100;
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p - decrement;
        if (next <= 0) {
          clearInterval(timerRef.current);
          setIsExiting(true);
          setTimeout(() => onDismiss(item.id), 200);
          return 0;
        }
        return next;
      });
    }, step);
    return () => clearInterval(timerRef.current);
  }, [duration, item.id, onDismiss]);

  const handleDismiss = () => {
    clearInterval(timerRef.current);
    setIsExiting(true);
    setTimeout(() => onDismiss(item.id), 200);
  };

  const typeLabels: Record<NotificationType, string> = {
    info: '提示',
    success: '成功',
    warning: '警告',
    error: '错误',
  };

  return (
    <div
      className={`w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${colors.border} ${colors.bg} transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.icon}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {typeLabels[item.type]}
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
              {item.title}
            </div>
            {item.message && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.message}
              </div>
            )}
            {item.action && (
              <button
                onClick={() => {
                  item.action!.onClick();
                  handleDismiss();
                }}
                className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {item.action.label}
              </button>
            )}
          </div>
        </div>
      </div>
      {duration > 0 && (
        <div className="h-0.5 bg-gray-100 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${colors.progress} transition-[width] ${
              isExiting ? 'duration-0' : ''
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Notification (Main Component) ────────────────────────────
export function Notification({
  position = 'top-right',
  maxVisible = 5,
  defaultDuration = 4000,
  className = '',
}: NotificationProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    return subscribe(setItems);
  }, []);

  const visibleItems = items.slice(0, maxVisible);

  const handleDismiss = useCallback((id: string) => {
    remove(id);
  }, []);

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 ${POSITION_MAP[position]} ${className}`}
    >
      {/* Bell indicator when there are notifications */}
      {items.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
          <Bell className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {items.length} 条通知
          </span>
          {items.length > 1 && (
            <button
              onClick={() => notify.dismissAll()}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1"
            >
              全部清除
            </button>
          )}
        </div>
      )}
      {visibleItems.map((item) => (
        <Toast
          key={item.id}
          item={item}
          defaultDuration={defaultDuration}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}

export default Notification;
