import { useAppQuery } from "@/hooks/useAppQuery";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const ManagePatientsPage = () => {
  const { appUsers, appointments, loading } = useAppQuery();
  
  const patients = appUsers.filter(u => u.role === 'patient');

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Manage Patients</h1>
      <p className="text-muted-foreground mb-8">View registered patients</p>

      <Card className="shadow-card border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-4 font-medium">Patient</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Appointments</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No patients registered.</td>
                  </tr>
                )}
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{p.name}</td>
                    <td className="p-4 text-muted-foreground">{p.email}</td>
                    <td className="p-4">{appointments.filter(a => a.patientId === p.id).length}</td>
                    <td className="p-4"><Badge variant="secondary">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ManagePatientsPage;
