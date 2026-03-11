import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface HospitalContextType {
  isOpen: boolean;
  toggleHospital: (status: boolean) => Promise<void>;
  isLoading: boolean;
  isClosingSoon: boolean;
}

const HospitalContext = createContext<HospitalContextType | null>(null);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosingSoon, setIsClosingSoon] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      // We'll use a specific table 'hospital_settings' or just localStorage for now 
      // as a fallback if the table doesn't exist.
      const savedStatus = localStorage.getItem("hospital_is_open");
      if (savedStatus !== null) {
        setIsOpen(savedStatus === "true");
      }

      // Try to fetch from supabase if we want it global
      const { data, error } = await supabase
        .from('hospital_settings')
        .select('value')
        .eq('key', 'is_open')
        .single();
      
      if (!error && data) {
        setIsOpen(data.value === 'true');
        localStorage.setItem("hospital_is_open", data.value);
      }
    } catch (err) {
      console.error("Error fetching hospital status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Check for closing soon status every minute
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Closing time is 8 PM (20:00)
      // "Closing soon" if it's after 7:30 PM (19:30)
      if (hour === 19 && now.getMinutes() >= 30) {
        setIsClosingSoon(true);
      } else if (hour >= 20 || hour < 9) {
        setIsClosingSoon(false); // It's already closed
      } else {
        setIsClosingSoon(false);
      }

      // Auto-close logic could also be added here if desired
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const toggleHospital = async (status: boolean) => {
    setIsOpen(status);
    localStorage.setItem("hospital_is_open", status.toString());
    
    try {
      const { error } = await supabase
        .from('hospital_settings')
        .upsert({ key: 'is_open', value: status.toString() }, { onConflict: 'key' });
      
      if (error) {
        console.warn("Could not save to Supabase (table might not exist), saved locally:", error.message);
      }
    } catch (err) {
      console.error("Error toggling hospital status:", err);
    }
    
    toast.success(status ? "Hospital is now OPEN" : "Hospital is now CLOSED");
  };

  return (
    <HospitalContext.Provider value={{ isOpen, toggleHospital, isLoading, isClosingSoon }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const ctx = useContext(HospitalContext);
  if (!ctx) throw new Error("useHospital must be used within HospitalProvider");
  return ctx;
};
