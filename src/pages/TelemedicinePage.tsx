import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";

const TelemedicinePage = () => {
  const { user } = useAuth();
  const { appointments, loading } = useAppQuery();
  
  const teleAppts = appointments.filter(a => a.type === "telemedicine");
  const myAppts = user?.role === "patient" 
    ? teleAppts.filter(a => a.patientId === "3") // patient testing id
    : user?.role === "doctor"
    ? teleAppts.filter(a => a.doctorId === user.id || a.doctorName.includes(user.name.split(' ')[1] || ''))
    : teleAppts;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Telemedicine</h1>
      <p className="text-muted-foreground mb-8">Virtual consultations with your doctor</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-card border-0 lg:col-span-2">
          <CardHeader><CardTitle>Upcoming Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {myAppts.length === 0 && <p className="text-sm text-muted-foreground">No telemedicine sessions scheduled</p>}
            {myAppts.map(apt => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user?.role === "patient" ? apt.doctorName : apt.patientName}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{apt.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => toast.info("Opening video consultation...")} className="gap-2">
                  <Video className="h-4 w-4" /> Join Session
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { step: "1", text: "Book a telemedicine appointment" },
              { step: "2", text: "Receive a confirmation with session link" },
              { step: "3", text: "Join the video call at your appointment time" },
              { step: "4", text: "Get your consultation report after the session" },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-sm text-muted-foreground pt-1">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default TelemedicinePage;
