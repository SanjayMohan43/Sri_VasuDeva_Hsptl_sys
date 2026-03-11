import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuth } from "@/contexts/AuthContext";

const ReportsPage = () => {
  const { user } = useAuth();
  const { appointments, loading } = useAppQuery();
  
  // Doctors see their completed appts, Admin sees all, Patients see their own
  const myAppts = user?.role === "patient" 
    ? appointments.filter(a => a.patientId === user.id)
    : user?.role === "doctor"
    ? appointments.filter(a => a.doctorId === user.id || a.doctorName.includes(user.name.split(' ')[1] || ''))
    : appointments;

  const completedAppts = myAppts.filter(a => a.status !== "cancelled");

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Consultation Reports</h1>
      <p className="text-muted-foreground mb-8">Upload notes and generate medical reports</p>

      <Card className="shadow-card border-0">
        <CardHeader><CardTitle>Patient Consultations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {completedAppts.length === 0 && <p className="text-sm text-muted-foreground">No completed consultations yet</p>}
          {completedAppts.map(apt => (
            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <FileText className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.role === "patient" ? apt.doctorName : apt.patientName}</p>
                  <p className="text-xs text-muted-foreground">{apt.date} · {apt.time} · {apt.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {user?.role !== "patient" && (
                  <Button size="sm" variant="outline" onClick={() => toast.success("Notes uploaded")}>
                    <Upload className="h-4 w-4 mr-1" /> Upload Notes
                  </Button>
                )}
                <Button size="sm" onClick={() => toast.success("PDF report generated")}>
                  <Download className="h-4 w-4 mr-1" /> Generate PDF
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportsPage;
