import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "appointment" | "medicine" | "delivery" | "system";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  addNotification: (n: Omit<Notification, "id" | "time" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevAptCount = useRef<number | null>(null);
  const prevReqCount = useRef<number | null>(null);

  const addNotification = useCallback((n: Omit<Notification, "id" | "time" | "read">) => {
    const newN: Notification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random()}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setNotifications(prev => [newN, ...prev].slice(0, 50));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to appointment changes
    const aptsChannel = supabase
      .channel(`notif-appointments-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        const apt = payload.new;
        if (user.role === "admin") {
          addNotification({
            type: "appointment",
            title: "New Appointment Booked",
            message: `${apt.patient_name} booked an appointment for ${apt.date} at ${apt.time} with ${apt.doctor_name}.`,
          });
        } else if (user.role === "patient" && apt.patient_id === user.id) {
          addNotification({
            type: "appointment",
            title: "Appointment Confirmed",
            message: `Your appointment with ${apt.doctor_name} on ${apt.date} at ${apt.time} is confirmed.`,
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, (payload) => {
        const apt = payload.new;
        if (user.role === "patient" && apt.patient_id === user.id) {
          const statusMessages: Record<string, string> = {
            visited: `Your appointment with ${apt.doctor_name} has been marked as Visited.`,
            missed: `Your appointment with ${apt.doctor_name} on ${apt.date} was marked as Missed.`,
            cancelled: `Your appointment with ${apt.doctor_name} has been cancelled.`,
            "in-progress": `Your appointment with ${apt.doctor_name} is now In Progress.`,
          };
          if (statusMessages[apt.status]) {
            addNotification({
              type: "appointment",
              title: `Appointment ${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}`,
              message: statusMessages[apt.status],
            });
          }
        }
        if (user.role === "admin" && apt.status === "cancelled") {
          addNotification({
            type: "appointment",
            title: "Appointment Cancelled",
            message: `${apt.patient_name} cancelled their appointment on ${apt.date} at ${apt.time}.`,
          });
        }
      })
      .subscribe();

    // Subscribe to medicine requests
    const reqsChannel = supabase
      .channel(`notif-requests-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'medicine_requests' }, (payload) => {
        const req = payload.new;
        if (user.role === "admin") {
          addNotification({
            type: "medicine",
            title: "New Medicine Request",
            message: `${req.patient_name} requested "${req.medicine_name}" with ₹${req.advance_paid} advance.`,
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'medicine_requests' }, (payload) => {
        const req = payload.new;
        if (user.role === "patient" && req.patient_id === user.id) {
          addNotification({
            type: "medicine",
            title: "Medicine Request Update",
            message: `Your request for "${req.medicine_name}" is now: ${req.status}.`,
          });
        }
      })
      .subscribe();

    // Subscribe to delivery orders
    const delChannel = supabase
      .channel(`notif-delivery-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'delivery_orders' }, (payload) => {
        const order = payload.new;
        if (user.role === "admin") {
          addNotification({
            type: "delivery",
            title: "New Delivery Order",
            message: `${order.patient_name} placed a medicine delivery order.`,
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'delivery_orders' }, (payload) => {
        const order = payload.new;
        if (user.role === "patient" && order.patient_id === user.id) {
          addNotification({
            type: "delivery",
            title: "Delivery Status Updated",
            message: `Your order #${order.id.slice(-6)} is now: ${order.status}.`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(aptsChannel);
      supabase.removeChannel(reqsChannel);
      supabase.removeChannel(delChannel);
    };
  }, [user, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
