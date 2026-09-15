import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getTasks } from "../redux/tasks/taskSlice";
import { fetchProjects } from "../redux/slices/projectSlice";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  formattedDateTime: string;
  type: "task" | "project" | "deadline" | "urgent" | "completed";
  targetType: "project" | "task";
  categoryBadge: string;
  categoryColor: string;
  priorityBadge: string;
  priorityColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  isRead: boolean;
  link: string;
  targetName: string;
  rawDate: Date;
}

export const formatExactDateTime = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const realAmPm = date.getHours() >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");
  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${realAmPm}`;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const futureSec = Math.abs(diffInSeconds);
    const futureDays = Math.ceil(futureSec / (24 * 3600));
    if (futureDays === 1) return "Due tomorrow";
    return `Due in ${futureDays}d`;
  }

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();

  const authState = useSelector((state: RootState) => state.auth);
  const taskState = useSelector((state: RootState) => state.tasks);
  const projectState = useSelector((state: RootState) => state.projects);

  const currentUser = authState?.user;
  const userId = currentUser?._id || currentUser?.id || currentUser?.email || "guest";
  const storageKey = `taskify_read_notifs_${userId}`;
  const dismissedKey = `taskify_dismissed_notifs_${userId}`;

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(dismissedKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch tasks and projects if not yet loaded
  useEffect(() => {
    const rawTasks = (taskState as any)?.tasks || (Array.isArray(taskState) ? taskState : []);
    const rawProjects = (projectState as any)?.projects || (Array.isArray(projectState) ? projectState : []);

    if (rawTasks.length === 0 && !taskState?.loading) {
      dispatch(getTasks());
    }
    if (rawProjects.length === 0 && !projectState?.loading) {
      dispatch(fetchProjects());
    }
  }, [dispatch, taskState?.loading, projectState?.loading]);

  // Generate dynamic notification items strictly from database records
  const notifications = useMemo<NotificationItem[]>(() => {
    const rawTasks: any[] = (taskState as any)?.tasks || (Array.isArray(taskState) ? taskState : []);
    const rawProjects: any[] = (projectState as any)?.projects || (Array.isArray(projectState) ? projectState : []);

    const items: NotificationItem[] = [];
    const now = new Date().getTime();

    // 1. Generate from user's tasks
    rawTasks.forEach((task: any) => {
      if (!task || !task._id) return;

      const createdDate = task.createdAt ? new Date(task.createdAt) : new Date();
      const updatedDate = task.updatedAt ? new Date(task.updatedAt) : createdDate;
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      const isCompleted = task.status === "completed";
      const isOverdue = dueDate ? dueDate.getTime() < now && !isCompleted : false;
      const isDueSoon = dueDate ? dueDate.getTime() >= now && (dueDate.getTime() - now) <= (2 * 24 * 3600 * 1000) && !isCompleted : false;
      const isHighPriority = task.priority === "high";

      const priorityCap = task.priority
        ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`
        : "Medium Priority";

      const priorityColor =
        task.priority === "high" ? "#ef4444" : task.priority === "low" ? "#64748b" : "#f59e0b";

      if (isCompleted) {
        items.push({
          id: `task-done-${task._id}`,
          title: `Task Completed: ${task.taskName}`,
          message: task.description || `Task "${task.taskName}" has been successfully completed.`,
          timestamp: updatedDate.toISOString(),
          timeAgo: formatTimeAgo(updatedDate),
          formattedDateTime: formatExactDateTime(updatedDate),
          type: "completed",
          targetType: "task",
          categoryBadge: "COMPLETED",
          categoryColor: "#10b981",
          priorityBadge: priorityCap,
          priorityColor,
          borderColor: "#10b981",
          iconBg: "#d1fae5",
          iconColor: "#10b981",
          isRead: readIds.includes(`task-done-${task._id}`),
          link: `/tasks/${task._id}`,
          targetName: task.taskName,
          rawDate: updatedDate,
        });
      } else if (isOverdue && dueDate) {
        items.push({
          id: `task-overdue-${task._id}`,
          title: `Overdue Task: ${task.taskName}`,
          message: task.description || `Task deadline was ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Please take action.`,
          timestamp: dueDate.toISOString(),
          timeAgo: formatTimeAgo(dueDate),
          formattedDateTime: formatExactDateTime(dueDate),
          type: "urgent",
          targetType: "task",
          categoryBadge: "URGENT",
          categoryColor: "#ef4444",
          priorityBadge: "High Priority",
          priorityColor: "#ef4444",
          borderColor: "#ef4444",
          iconBg: "#fee2e2",
          iconColor: "#ef4444",
          isRead: readIds.includes(`task-overdue-${task._id}`),
          link: `/tasks/${task._id}`,
          targetName: task.taskName,
          rawDate: dueDate,
        });
      } else if (isDueSoon && dueDate) {
        items.push({
          id: `task-deadline-${task._id}`,
          title: `Upcoming Deadline: ${task.taskName}`,
          message: task.description || `Task is due on ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
          timestamp: dueDate.toISOString(),
          timeAgo: formatTimeAgo(dueDate),
          formattedDateTime: formatExactDateTime(dueDate),
          type: "deadline",
          targetType: "task",
          categoryBadge: "DEADLINE",
          categoryColor: "#f59e0b",
          priorityBadge: priorityCap,
          priorityColor,
          borderColor: "#f59e0b",
          iconBg: "#fef3c7",
          iconColor: "#f59e0b",
          isRead: readIds.includes(`task-deadline-${task._id}`),
          link: `/tasks/${task._id}`,
          targetName: task.taskName,
          rawDate: dueDate,
        });
      } else if (isHighPriority) {
        items.push({
          id: `task-high-${task._id}`,
          title: `High Priority Task: ${task.taskName}`,
          message: task.description || `High priority task needs your attention.`,
          timestamp: createdDate.toISOString(),
          timeAgo: formatTimeAgo(createdDate),
          formattedDateTime: formatExactDateTime(createdDate),
          type: "urgent",
          targetType: "task",
          categoryBadge: "URGENT",
          categoryColor: "#ef4444",
          priorityBadge: "High Priority",
          priorityColor: "#ef4444",
          borderColor: "#ef4444",
          iconBg: "#fee2e2",
          iconColor: "#ef4444",
          isRead: readIds.includes(`task-high-${task._id}`),
          link: `/tasks/${task._id}`,
          targetName: task.taskName,
          rawDate: createdDate,
        });
      } else {
        items.push({
          id: `task-active-${task._id}`,
          title: `Task: ${task.taskName}`,
          message: task.description || `Task in progress. Status: ${task.status}`,
          timestamp: createdDate.toISOString(),
          timeAgo: formatTimeAgo(createdDate),
          formattedDateTime: formatExactDateTime(createdDate),
          type: "task",
          targetType: "task",
          categoryBadge: "TASK",
          categoryColor: "#06b6d4",
          priorityBadge: priorityCap,
          priorityColor,
          borderColor: "#3b82f6",
          iconBg: "#ede9fe",
          iconColor: "#6366f1",
          isRead: readIds.includes(`task-active-${task._id}`),
          link: `/tasks/${task._id}`,
          targetName: task.taskName,
          rawDate: createdDate,
        });
      }
    });

    // 2. Generate from user's projects
    rawProjects.forEach((proj: any) => {
      if (!proj || !proj._id) return;

      const createdDate = proj.createdAt ? new Date(proj.createdAt) : new Date();
      const dueDate = proj.dueDate ? new Date(proj.dueDate) : null;
      const isOverdue = dueDate ? dueDate.getTime() < now && proj.status !== "completed" : false;

      const priorityCap = proj.priority
        ? `${proj.priority.charAt(0).toUpperCase() + proj.priority.slice(1)} Priority`
        : "High Priority";

      const priorityColor =
        proj.priority === "medium" ? "#f59e0b" : proj.priority === "low" ? "#64748b" : "#ef4444";

      if (isOverdue && dueDate) {
        items.push({
          id: `proj-overdue-${proj._id}`,
          title: `Project Deadline Overdue: ${proj.projectName}`,
          message: proj.description || `Project deadline passed on ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
          timestamp: dueDate.toISOString(),
          timeAgo: formatTimeAgo(dueDate),
          formattedDateTime: formatExactDateTime(dueDate),
          type: "urgent",
          targetType: "project",
          categoryBadge: "URGENT",
          categoryColor: "#ef4444",
          priorityBadge: priorityCap,
          priorityColor,
          borderColor: "#ef4444",
          iconBg: "#fee2e2",
          iconColor: "#ef4444",
          isRead: readIds.includes(`proj-overdue-${proj._id}`),
          link: `/projects/${proj._id}`,
          targetName: proj.projectName,
          rawDate: dueDate,
        });
      } else {
        items.push({
          id: `proj-${proj._id}`,
          title: `Project: ${proj.projectName}`,
          message: proj.description || `Project is currently ${proj.status || "Active"}.`,
          timestamp: createdDate.toISOString(),
          timeAgo: formatTimeAgo(createdDate),
          formattedDateTime: formatExactDateTime(createdDate),
          type: "project",
          targetType: "project",
          categoryBadge: "PROJECT",
          categoryColor: "#2563eb",
          priorityBadge: priorityCap,
          priorityColor,
          borderColor: "#3b82f6",
          iconBg: "#dbeafe",
          iconColor: "#2563eb",
          isRead: readIds.includes(`proj-${proj._id}`),
          link: `/projects/${proj._id}`,
          targetName: proj.projectName,
          rawDate: createdDate,
        });
      }
    });

    // Filter out dismissed notifications
    const visibleItems = items.filter((item) => !dismissedIds.includes(item.id));

    // Sort by latest first
    visibleItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    return visibleItems;
  }, [taskState, projectState, readIds, dismissedIds]);

  // Mark single as read
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save read state", err);
      }
      return updated;
    });
  }, [storageKey]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(storageKey, JSON.stringify(merged));
      } catch (err) {
        console.error("Failed to save read state", err);
      }
      return merged;
    });
  }, [notifications, storageKey]);

  // Dismiss a notification
  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(dismissedKey, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save dismissed state", err);
      }
      return updated;
    });
  }, [dismissedKey]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds((prev) => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(dismissedKey, JSON.stringify(merged));
      } catch (err) {
        console.error("Failed to save dismissed state", err);
      }
      return merged;
    });
  }, [notifications, dismissedKey]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const loading = Boolean(taskState?.loading || projectState?.loading);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    refresh: () => {
      dispatch(getTasks());
      dispatch(fetchProjects());
    },
  };
};
