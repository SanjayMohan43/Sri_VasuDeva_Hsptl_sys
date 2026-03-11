import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Pill, ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { supabase } from "@/lib/supabase";

const PharmacyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { medicines, loading } = useAppQuery();
  const [search, setSearch] = useState("");
  const [storeOpen] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    toast.success("Added to cart");
  };

  const cartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);
  const cartTotal = cartItems.reduce((sum, [id, qty]) => {
    const med = medicines.find(m => m.id === id);
    return sum + (med?.price || 0) * qty;
  }, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    
    const { error } = await supabase.from('delivery_orders').insert({
      id: `d${Date.now()}`,
      patient_id: user?.id || "",
      patient_name: user?.name || "",
      address: "Home Address (Updated in Delivery Page)", // Default placeholder
      distance: 2.5,
      status: "pending",
      estimated_time: "30 mins",
      date: new Date().toISOString().split('T')[0]
    });

    setIsCheckingOut(false);
    
    if (error) {
      toast.error("Checkout failed");
      console.error(error);
      return;
    }

    setCart({});
    toast.success("Order placed successfully! Check 'Medicine Delivery' for status.");
    navigate("/delivery");
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!storeOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Pill className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Store Closed</h2>
        <p className="text-muted-foreground">The pharmacy is currently closed. Please check back later.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy</h1>
          <p className="text-muted-foreground mt-1">Browse and order medicines</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-success text-success-foreground">Store Open</Badge>
          {cartItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <ShoppingCart className="h-3 w-3" /> {cartItems.length} items · ₹{cartTotal.toFixed(2)}
              </Badge>
              <Button size="sm" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ShoppingCart className="h-3 w-3 mr-1" />}
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {user?.role === "admin" && (
        <Card className="shadow-card border-0 mb-6">
          <CardHeader><CardTitle className="text-lg">Inventory Management</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Medicine</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {medicines.map(med => (
                    <tr key={med.id}>
                      <td className="py-3 font-medium text-foreground">{med.name}</td>
                      <td className="py-3 text-muted-foreground">{med.category}</td>
                      <td className="py-3">₹{med.price.toFixed(2)}</td>
                      <td className="py-3">{med.stock}</td>
                      <td className="py-3">
                        <Badge variant={med.available ? "default" : "destructive"}>
                          {med.available ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(med => (
          <Card key={med.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Pill className="h-5 w-5 text-accent-foreground" />
                </div>
                <Badge variant={med.available ? "default" : "destructive"} className="text-xs">
                  {med.available ? "Available" : "Out of Stock"}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{med.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{med.description}</p>
              <p className="text-sm text-muted-foreground mb-3">{med.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">₹{med.price.toFixed(2)}</span>
                {user?.role === "patient" && med.available && (
                  <Button size="sm" onClick={() => addToCart(med.id)}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {search && filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 px-4 text-center bg-secondary/30 rounded-2xl border-2 border-dashed border-muted"
        >
          <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">"{search}" Not Found</h3>
          <p className="text-muted-foreground max-w-xs mb-6">
            We couldn't find any medicine matching your search. You can request it from our pharmacy team.
          </p>
          <Button onClick={() => navigate("/medicine-requests")} className="gap-2">
            <Pill className="h-4 w-4" /> Request this Medicine
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PharmacyPage;
