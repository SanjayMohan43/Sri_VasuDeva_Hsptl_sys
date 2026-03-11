import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { supabase } from "@/lib/supabase";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments, doctors, loading } = useAppQuery();
  const [localAppointments, setLocalAppointments] = useState(appointments);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState<"in-person" | "telemedicine">("in-person");
  const [isBooking, setIsBooking] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Sync local state when Supabase fetch completes
  if (appointments.length > 0 && localAppointments.length === 0) {
    setLocalAppointments(appointments);
  }

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

    const newApt = {
      id: newId,
      patientId: user?.id || "",
      patientName: user?.name || "",
      doctorId: selectedDoctor,
      doctorName: doctor?.name || "",
      date: selectedDate,
      time: selectedTime,
      status: "scheduled" as const,
      type: selectedType,
      queueNumber: queueNumber,
    };

    setLocalAppointments([...localAppointments, newApt]);
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

      {(user?.role === "patient") && (
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
        <CardHeader><CardTitle>{user?.role === "patient" ? "My Appointments" : "All Appointments"}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myAppointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments found</p>}
            {myAppointments.map(apt => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{user?.role === "patient" ? apt.doctorName : apt.patientName}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{apt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                    <span className="flex items-center gap-1">
                      {apt.type === "telemedicine" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {apt.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {apt.queueNumber && <Badge variant="outline">Q#{apt.queueNumber}</Badge>}
                  <Badge variant={apt.status === "in-progress" ? "default" : apt.status === "completed" ? "secondary" : apt.status === "cancelled" ? "destructive" : "outline"}>
                    {apt.status}
                  </Badge>
                  {apt.type === "telemedicine" && apt.status === "scheduled" && (
                    <Button size="sm" variant="outline" onClick={() => toast.info("Joining telemedicine session...")}>
                      <Video className="h-4 w-4 mr-1" /> Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AppointmentsPage;
