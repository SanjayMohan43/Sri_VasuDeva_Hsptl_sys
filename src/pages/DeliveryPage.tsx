import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TruckIcon, MapPin, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";

const DeliveryPage = () => {
  const { user } = useAuth();
  const { deliveryOrders, loading } = useAppQuery();
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState<number | null>(null);

  const checkDistance = () => {
    // Simulate distance check
    const d = parseFloat((Math.random() * 8 + 1).toFixed(1));
    setDistance(d);
    if (d <= 5) {
      toast.success(`You're ${d} km away — free delivery available!`);
    } else {
      toast.warning(`You're ${d} km away — outside delivery radius`);
    }
  };

  const eligible = distance !== null && distance <= 5;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myOrders = user?.role === "patient"
    ? deliveryOrders.filter(o => o.patientId === user.id)
    : deliveryOrders;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Delivery</h1>
      <p className="text-muted-foreground mb-8">Free delivery within 5 km radius — delivered in 30 minutes</p>

      {user?.role === "patient" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardHeader><CardTitle>Check Delivery Eligibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Address</Label>
                <Input placeholder="Enter your delivery address" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <Button onClick={checkDistance} disabled={!address}>
                <MapPin className="h-4 w-4 mr-2" /> Check Distance
              </Button>

              {distance !== null && (
                <div className={`p-4 rounded-lg ${eligible ? "bg-accent" : "bg-destructive/10"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {eligible ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="font-semibold text-foreground">{distance} km from pharmacy</span>
                  </div>
                  {eligible ? (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1"><TruckIcon className="h-4 w-4" /> Free delivery available</p>
                      <p className="flex items-center gap-1"><Clock className="h-4 w-4" /> Estimated: within 30 minutes</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Delivery is only available within 5 km. Please visit the pharmacy to purchase.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardHeader><CardTitle>Delivery Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-accent">
                <h3 className="font-semibold text-accent-foreground mb-2">Delivery Policy</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Free delivery within 5 km</li>
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Delivery within 30 minutes</li>
                  <li className="flex items-center gap-2"><TruckIcon className="h-4 w-4 text-primary" /> Track your order in real-time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-card border-0">
        <CardHeader><CardTitle>{user?.role === "admin" ? "All Delivery Orders" : "My Delivery Orders"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myOrders.length === 0 && <p className="text-sm text-muted-foreground">No active deliveries</p>}
          {myOrders.map(order => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-3">
              <div>
                <p className="font-semibold text-foreground">Order #{order.id} {user?.role === "admin" && `— ${order.patientName}`}</p>
                <p className="text-sm text-muted-foreground">
                  {order.medicines && order.medicines.length > 0 
                    ? order.medicines.map(m => m.name).join(", ") 
                    : "Medicines package"}
                </p>
                <p className="text-xs text-muted-foreground">{order.address} · {order.distance} km</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{order.status}</Badge>
                <span className="text-sm text-muted-foreground">ETA: {order.estimatedTime}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeliveryPage;
