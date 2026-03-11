import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Store, Pill, TruckIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useHospital } from "@/contexts/HospitalContext";

const StoreSettingsPage = () => {
  const { isOpen: storeOpen, toggleHospital } = useHospital();
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [deliveryRadius, setDeliveryRadius] = useState(5);

  const toggleStore = (open: boolean) => {
    toggleHospital(open);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-foreground mb-2">Store Settings</h1>
      <p className="text-muted-foreground mb-8">Manage pharmacy status and delivery settings</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" /> Pharmacy Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-semibold text-foreground">Store Status</p>
                <p className="text-sm text-muted-foreground">Toggle to open or close the pharmacy</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={storeOpen ? "default" : "destructive"}>
                  {storeOpen ? "Open" : "Closed"}
                </Badge>
                <Switch checked={storeOpen} onCheckedChange={toggleStore} />
              </div>
            </div>

            {!storeOpen && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">⚠ Pharmacy Closed</p>
                <p className="text-xs text-muted-foreground mt-1">All ordering and delivery is currently disabled.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5" /> Delivery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-semibold text-foreground">Enable Delivery</p>
                <p className="text-sm text-muted-foreground">Allow home delivery of medicines</p>
              </div>
              <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
            </div>

            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-semibold text-foreground mb-2">Delivery Radius</p>
              <p className="text-sm text-muted-foreground mb-3">Current radius: {deliveryRadius} km</p>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map(r => (
                  <Button key={r} size="sm" variant={deliveryRadius === r ? "default" : "outline"} onClick={() => { setDeliveryRadius(r); toast.success(`Radius set to ${r} km`); }}>
                    {r} km
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default StoreSettingsPage;
