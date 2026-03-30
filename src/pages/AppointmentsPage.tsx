import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, MapPin, Loader2, CheckCircle2, XCircle, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { supabase } from "@/lib/supabase";
import { Appointment } from "@/data/mockData";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

/**
 * Computes the effective display status for an appointment:
 * - If status is already set by admin (visited, missed, cancelled, in-progress, completed) → keep it
 * - If still "scheduled" but the datetime has passed → auto-display as "missed"
 * - Otherwise → "upcoming"
 */
const getEffectiveStatus = (apt: Appointment): Appointment["status"] | "upcoming" => {
  if (apt.status !== "scheduled") return apt.status;
  const timeParts = apt.time.split(':');
  const timeStr = timeParts.length === 2 ? `${apt.time}:00` : apt.time;
  const aptDateTime = new Date(`${apt.date}T${timeStr}`);
  return (isNaN(aptDateTime.getTime()) || aptDateTime < new Date()) ? "missed" : "upcoming";
};

const statusBadgeVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "in-progress" || s === "visited" || s === "completed") return "default";
  if (s === "cancelled" || s === "missed") return "destructive";
  if (s === "upcoming" || s === "scheduled") return "outline";
  return "secondary";
};

const statusColor = (s: string) => {
  if (s === "visited" || s === "completed") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (s === "in-progress") return "text-blue-600 bg-blue-50 border-blue-200";
  if (s === "missed") return "text-orange-600 bg-orange-50 border-orange-200";
  if (s === "cancelled") return "text-red-600 bg-red-50 border-red-200";
  return "text-foreground";
};

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments, doctors, loading } = useAppQuery();
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState<"in-person" | "telemedicine">("in-person");
  const [isBooking, setIsBooking] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // Sync appointments from hook
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  /** Update a single appointment's status in Supabase and locally */
  const updateStatus = async (aptId: string, newStatus: Appointment["status"]) => {
    setActionLoading(aptId + newStatus);
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', aptId);

    setActionLoading(null);
    if (error) {
      toast.error("Failed to update appointment status");
      console.error(error);
      return;
    }
    setLocalAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a)
    );
    toast.success(`Appointment marked as ${newStatus}`);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please fill all fields");
      return;
    }
    if (selectedDate < todayStr) {
      toast.error("Please select a current or future date");
      return;
    }

    setIsBooking(true);
    const doctor = doctors.find(d => d.id === selectedDoctor);
    const queueNumber = localAppointments.filter(a => a.doctorId === selectedDoctor && a.date === selectedDate).length + 1;
    const newId = `a${Date.now()}`;

    const { error } = await supabase.from('appointments').insert({
      id: newId,
      patient_id: user?.id || "",
      patient_name: user?.name || "",
      doctor_id: selectedDoctor,
      doctor_name: doctor?.name || "",
      date: selectedDate,
      time: selectedTime,
      status: "scheduled",
      type: selectedType,
      queue_number: queueNumber
    });

    setIsBooking(false);

    if (error) {
      toast.error("Failed to book appointment");
      console.error(error);
      return;
    }

    const newApt: Appointment = {
      id: newId,
      patientId: user?.id || "",
      patientName: user?.name || "",
      doctorId: selectedDoctor,
      doctorName: doctor?.name || "",
      date: selectedDate,
      time: selectedTime,
      status: "scheduled",
      type: selectedType,
      queueNumber,
    };

    setLocalAppointments(prev => [...prev, newApt]);
    toast.success(`Appointment booked! Queue #${newApt.queueNumber}`);
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedTime("");
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myAppointments = user?.role === "patient"
    ? localAppointments.filter(a => a.patientId === user.id)
    : user?.role === "doctor"
    ? localAppointments.filter(a => a.doctorId === user.id || a.doctorName.includes(user.name.split(' ')[1] || ''))
    : localAppointments;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
      <p className="text-muted-foreground mb-8">Manage and book appointments</p>

      {/* Patient booking form */}
      {user?.role === "patient" && (
        <Card className="shadow-card border-0 mb-8">
          <CardHeader><CardTitle>Book New Appointment</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                min={todayStr}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger><SelectValue placeholder="Select Time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={(v: "in-person" | "telemedicine") => setSelectedType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="telemedicine">Telemedicine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="mt-4" onClick={handleBook} disabled={isBooking}>
              {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBooking ? 'Booking...' : 'Book Appointment'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>{user?.role === "patient" ? "My Appointments" : "All Appointments"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myAppointments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No appointments found</p>
            )}
            <AnimatePresence>
              {myAppointments.map(apt => {
                const effective = getEffectiveStatus(apt);
                const isLoading = actionLoading?.startsWith(apt.id);
                const isPast = new Date(`${apt.date}T${apt.time}:00`) < new Date();

                return (
                  <motion.div
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50 gap-3 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <p className="font-semibold text-foreground">
                        {user?.role === "patient" ? apt.doctorName : apt.patientName}
                      </p>
                      {user?.role !== "patient" && (
                        <p className="text-xs text-muted-foreground">Patient: {apt.patientName}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{apt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                        <span className="flex items-center gap-1">
                          {apt.type === "telemedicine" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {apt.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {apt.queueNumber && <Badge variant="outline">Q#{apt.queueNumber}</Badge>}

                      {/* Status Badge */}
                      <Badge
                        className={cn(
                          "text-xs border capitalize",
                          effective === "visited" || effective === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" :
                          effective === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300" :
                          effective === "missed" ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300" :
                          effective === "cancelled" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300" :
                          "bg-secondary text-secondary-foreground border-border"
                        )}
                        variant="outline"
                      >
                        {effective === "upcoming" ? "Upcoming" : effective.charAt(0).toUpperCase() + effective.slice(1)}
                      </Badge>

                      {/* Telemedicine join button */}
                      {apt.type === "telemedicine" && effective === "upcoming" && (
                        <Button size="sm" variant="outline" onClick={() => toast.info("Joining telemedicine session...")}>
                          <Video className="h-4 w-4 mr-1" /> Join
                        </Button>
                      )}

                      {/* Patient: Cancel button (only for upcoming/scheduled appointments) */}
                      {user?.role === "patient" && (apt.status === "scheduled") && !isPast && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isLoading}
                          onClick={() => updateStatus(apt.id, "cancelled")}
                        >
                          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                          Cancel
                        </Button>
                      )}

                      {/* Admin actions */}
                      {user?.role === "admin" && apt.status === "scheduled" && (
                        <div className="flex gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            disabled={isLoading}
                            onClick={() => updateStatus(apt.id, "visited")}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                            Mark Visited
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            disabled={isLoading}
                            onClick={() => updateStatus(apt.id, "missed")}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                            Missed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            disabled={isLoading}
                            onClick={() => updateStatus(apt.id, "cancelled")}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Small helper to avoid importing cn from lib/utils separately inside JSX
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default AppointmentsPage;
