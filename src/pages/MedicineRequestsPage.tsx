import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { supabase } from "@/lib/supabase";

const MedicineRequestsPage = () => {
  const { user } = useAuth();
  const { requests, loading } = useAppQuery();
  const [localRequests, setLocalRequests] = useState(requests);
  const [medicineName, setMedicineName] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (requests.length > 0 && localRequests.length === 0) {
    setLocalRequests(requests);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newId = `r${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('medicine_requests').insert({
      id: newId,
      patient_id: user?.id || "",
      patient_name: user?.name || "",
      medicine_name: medicineName,
      advance_paid: parseFloat(advanceAmount),
      status: "pending",
      date: today
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to submit request");
      console.error(error);
      return;
    }

    const newReq = {
      id: newId,
      patientId: user?.id || "",
      patientName: user?.name || "",
      medicineName,
      advancePaid: parseFloat(advanceAmount),
      status: "pending" as const,
      date: today,
    };
    
    setLocalRequests([newReq, ...localRequests]);
    toast.success("Medicine request submitted!");
    setMedicineName("");
    setAdvanceAmount("");
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('medicine_requests').update({ status: 'approved' }).eq('id', id);
    
    if (error) {
      toast.error("Failed to approve request");
      return;
    }
    
    setLocalRequests(localRequests.map(r => r.id === id ? { ...r, status: "approved" as const } : r));
    toast.success("Request approved");
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myRequests = user?.role === "patient" 
    ? localRequests.filter(r => r.patientId === user.id)
    : localRequests;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Requests</h1>
      <p className="text-muted-foreground mb-8">Request medicines not currently in stock</p>

      {user?.role === "patient" && (
        <Card className="shadow-card border-0 mb-8">
          <CardHeader><CardTitle>Submit New Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Medicine Name</Label>
                <Input placeholder="Enter medicine name" value={medicineName} onChange={e => setMedicineName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Advance Payment (₹)</Label>
                <Input type="number" min="1" placeholder="e.g., 500" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} required />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card border-0">
        <CardHeader><CardTitle>{user?.role === "admin" ? "All Requests" : "My Requests"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myRequests.length === 0 && <p className="text-sm text-muted-foreground">No requests found</p>}
          {myRequests.map(req => (
            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{req.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "admin" && `${req.patientName} · `}Advance: ₹{req.advancePaid} · {req.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  req.status === "pending" ? "outline" :
                  req.status === "approved" ? "default" :
                  req.status === "arrived" ? "secondary" : "destructive"
                }>{req.status}</Badge>
                {user?.role === "admin" && req.status === "pending" && (
                  <Button size="sm" onClick={() => handleApprove(req.id)}>Approve</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MedicineRequestsPage;
