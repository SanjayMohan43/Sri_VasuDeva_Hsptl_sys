import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Mail, Phone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";

const ManageDoctorsPage = () => {
  const { doctors, loading } = useAppQuery();

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Doctors</h1>
          <p className="text-muted-foreground mt-1">View and manage doctor accounts</p>
        </div>
        <Button>Add Doctor</Button>
      </div>

      {doctors.length === 0 && (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No doctors found.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map(doc => (
          <Card key={doc.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{doc.name}</h3>
                  <p className="text-sm text-primary font-medium">{doc.specialty}</p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    {doc.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{doc.email}</span>}
                    {doc.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{doc.phone}</span>}
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {doc.availableDays.map(d => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default ManageDoctorsPage;
