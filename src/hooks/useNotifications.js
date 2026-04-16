import { useState, useMemo, useCallback } from "react";
import { fmtDate } from "../utils/dateUtils.js";

export default function useNotifications(initialNotifications, currentUser) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = useCallback((userId, type, title, message, eventId = null) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: Date.now(),
        userId,
        type,
        title,
        message,
        eventId,
        read: false,
        createdAt: fmtDate(new Date()),
      },
    ]);
  }, []);

  const userNotifs = useMemo(
    () =>
      notifications
        .filter((n) => n.userId === currentUser?.id)
        .sort((a, b) => b.id - a.id),
    [notifications, currentUser],
  );

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n,
      ),
    );
  }, [currentUser]);

  return {
    notifications,
    userNotifs,
    unreadCount,
    addNotification,
    markAllRead,
    setNotifications,
  };
}
