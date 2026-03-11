import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { supabase } from "@/lib/supabase";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SchedulePage = () => {
  const { user } = useAuth();
  const { doctors, loading } = useAppQuery();
  
  // Find current doctor
  const doctor = doctors.find(d => d.id === user?.id || d.name.includes(user?.name?.split(' ')[1] || ''));
  
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [activeSlots, setActiveSlots] = useState(timeSlots.slice(0, 8)); // Hardcoded slots for demo
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (doctor && availableDays.length === 0) {
      setAvailableDays(doctor.availableDays);
    }
  }, [doctor]);

  const toggleDay = async (day: string) => {
    if (!doctor) return;
    
    setIsUpdating(true);
    const newDays = availableDays.includes(day) 
      ? availableDays.filter(d => d !== day) 
      : [...availableDays, day];
      
    const { error } = await supabase.from('doctors').update({ available_days: newDays }).eq('id', doctor.id);
    
    setIsUpdating(false);
    
    if (error) {
      toast.error("Failed to update schedule");
      return;
    }
    
    setAvailableDays(newDays);
    toast.success(`Schedule updated`);
  };

  const toggleSlot = (slot: string) => {
    setActiveSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  if (loading || isUpdating && availableDays.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor && user?.role === 'doctor') {
    return <div className="p-8 text-center text-muted-foreground">Doctor profile not found in database.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">My Schedule</h1>
      <p className="text-muted-foreground mb-8">Manage your availability and appointment slots</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Working Days</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {days.map(day => (
              <div key={day} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="font-medium text-foreground">{day}</span>
                <Switch 
                  disabled={isUpdating}
                  checked={availableDays.includes(day)} 
                  onCheckedChange={() => toggleDay(day)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Time Slots</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(slot => (
                <Button
                  key={slot}
                  variant={activeSlots.includes(slot) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSlot(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default SchedulePage;
