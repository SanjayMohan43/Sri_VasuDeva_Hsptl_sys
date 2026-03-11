import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";

const QueuePage = () => {
  const { appointments, loading } = useAppQuery();
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Use today's date if available, else fallback to something with data for demo purposes
  const hasTodayData = appointments.some(a => a.date === todayStr);
  const targetDate = hasTodayData ? todayStr : "2026-03-12"; // Match mock date if no real data

  const todayAppointments = appointments.filter(a => a.date === targetDate);
  const doctorQueues = todayAppointments.reduce((acc, apt) => {
    if (!acc[apt.doctorName]) acc[apt.doctorName] = [];
    acc[apt.doctorName].push(apt);
    return acc;
  }, {} as Record<string, typeof todayAppointments>);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Queue Status</h1>
      <p className="text-muted-foreground mb-8">Real-time appointment queue for {targetDate}</p>

      {Object.keys(doctorQueues).length === 0 && (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No appointments in queue for today.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(doctorQueues).map(([doctor, queue]) => (
          <Card key={doctor} className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">{doctor}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0)).map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      apt.status === "in-progress" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      #{apt.queueNumber || '-'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{apt.time} · {apt.type}</p>
                    </div>
                  </div>
                  <Badge variant={apt.status === "in-progress" ? "default" : "secondary"}>
                    {apt.status === "in-progress" ? "Now Serving" : "Waiting"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default QueuePage;
