import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Pill, ShoppingCart, Plus, Minus, Loader2, X, Receipt, CheckCircle2, Printer, Download } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type CartMap = Record<string, number>;

interface ReceiptData {
  orderId: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  patientName: string;
}

const HOSPITAL_NAME = "Sri VasuDeva Medicals";
const HOSPITAL_ADDRESS = "Opp to Sanjay Glass Mart, Huzurabad Road, Parkal, Bhupalpally Dist - 506164";
const HOSPITAL_PHONE = "+91-98765-00000";
const HOSPITAL_GST = "36XXXXX1234Z1";

const PharmacyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { medicines, loading } = useAppQuery();
  const [search, setSearch] = useState("");
  const [storeOpen] = useState(true);
  const [cart, setCart] = useState<CartMap>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(medicines.map(m => m.category.split(" ")[0])))].slice(0, 10);

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || m.category.startsWith(activeCategory);
    return matchSearch && matchCat;
  });

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    toast.success("Added to cart");
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id] = (next[id] || 0) - 1;
      return next;
    });
  };

  const clearCart = () => setCart({});

  const cartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);
  const cartTotal = cartItems.reduce((sum, [id, qty]) => {
    const med = medicines.find(m => m.id === id);
    return sum + (med?.price || 0) * qty;
  }, 0);
  const cartCount = cartItems.reduce((sum, [_, qty]) => sum + qty, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);

    const orderId = `ORD-${Date.now()}`;
    const billId = `BILL-${Date.now()}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const itemsForDb = cartItems.map(([id, qty]) => {
      const med = medicines.find(m => m.id === id);
      return { name: med?.name || id, qty, price: med?.price || 0 };
    });

    // 1. Create delivery order
    const { error: orderError } = await supabase.from('delivery_orders').insert({
      id: orderId,
      patient_id: user?.id || "",
      patient_name: user?.name || "",
      medicines: itemsForDb,
      address: "Home Address (Update in Delivery Page)",
      distance: 2.5,
      status: "processing",
      estimated_time: "30 mins",
      date: now.toISOString().split('T')[0]
    });

    if (orderError) {
      setIsCheckingOut(false);
      console.error("Checkout error:", orderError);
      toast.error(`Checkout failed: ${orderError.message}`);
      return;
    }

    // 2. Save bill/receipt to bills table
    const { error: billError } = await supabase.from('bills').insert({
      id: billId,
      order_id: orderId,
      patient_id: user?.id || "",
      patient_name: user?.name || "",
      items: itemsForDb,
      subtotal: cartTotal,
      total: cartTotal,
      created_at: now.toISOString(),
      hospital_name: HOSPITAL_NAME,
      hospital_address: HOSPITAL_ADDRESS,
    });

    setIsCheckingOut(false);

    if (billError) {
      console.warn("Bill save failed (order still placed):", billError.message);
    }

    // 3. Show receipt modal
    setReceipt({
      orderId,
      date: dateStr + " " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      items: itemsForDb,
      total: cartTotal,
      patientName: user?.name || "Patient",
    });
    setCart({});
    setShowCart(false);
    toast.success("Order placed successfully!");
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById("receipt-content");
    if (!input || !receipt) return;

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, (pdfWidth - 20) * (canvas.height / canvas.width));
      pdf.save(`Receipt_${receipt.orderId}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Failed to generate PDF");
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy</h1>
          <p className="text-muted-foreground mt-1">Browse and order medicines — {medicines.length} medicines available</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-success text-success-foreground">Store Open</Badge>
          {user?.role === "patient" && (
            <Button
              variant={cartCount > 0 ? "default" : "outline"}
              size="sm"
              className="gap-2 relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="ml-1 bg-white/20 text-white rounded-full text-xs px-1.5 font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, category, formula..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Admin Inventory Table */}
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
                      <td className="py-3 text-muted-foreground text-xs">{med.category}</td>
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

      {/* Medicine Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(med => (
          <Card key={med.id} className={`shadow-card border-0 hover:shadow-elevated transition-all ${!med.available ? "opacity-60" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Pill className="h-5 w-5 text-accent-foreground" />
                </div>
                <Badge variant={med.available ? "default" : "destructive"} className="text-xs">
                  {med.available ? "Available" : "Out of Stock"}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm leading-tight">{med.name}</h3>
              <p className="text-xs text-primary/80 font-medium mb-1">{med.category}</p>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-3">{med.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">₹{med.price.toFixed(2)}</span>
                {user?.role === "patient" && med.available && (
                  <div className="flex items-center gap-1">
                    {cart[med.id] ? (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => removeFromCart(med.id)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold w-5 text-center">{cart[med.id]}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => addToCart(med.id)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => addToCart(med.id)}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    )}
                  </div>
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
          className="flex flex-col items-center justify-center py-12 px-4 text-center bg-secondary/30 rounded-2xl border-2 border-dashed border-muted mt-4"
        >
          <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">"{search}" Not Found</h3>
          <p className="text-muted-foreground max-w-xs mb-6">
            We couldn't find this medicine. You can request it from our pharmacy team.
          </p>
          <Button onClick={() => navigate("/medicine-requests")} className="gap-2">
            <Pill className="h-4 w-4" /> Request this Medicine
          </Button>
        </motion.div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Your Cart
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cartItems.map(([id, qty]) => {
                    const med = medicines.find(m => m.id === id);
                    if (!med) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-medium text-sm leading-tight">{med.name}</p>
                          <p className="text-xs text-muted-foreground">₹{med.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => removeFromCart(id)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-5 text-center">{qty}</span>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => addToCart(id)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold ml-3 w-16 text-right">
                          ₹{(med.price * qty).toFixed(2)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t space-y-4">
                  <div className="space-y-1.5">
                    {cartItems.map(([id, qty]) => {
                      const med = medicines.find(m => m.id === id);
                      if (!med) return null;
                      return (
                        <div key={id} className="flex justify-between text-xs text-muted-foreground">
                          <span>{med.name.split(" ")[0]} × {qty}</span>
                          <span>₹{(med.price * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={clearCart}>Clear</Button>
                    <Button className="flex-1 gap-2" onClick={handleCheckout} disabled={isCheckingOut}>
                      {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                      {isCheckingOut ? "Placing..." : "Checkout"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setReceipt(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-card text-foreground rounded-2xl shadow-2xl max-w-sm w-full p-6 z-10"
            >
              <div id="receipt-content" className="bg-white p-4 -m-4 mb-2 rounded-xl">
                {/* Receipt Header */}
                <div className="text-center mb-4 pb-4 border-b border-dashed">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <h2 className="text-lg font-bold text-foreground">{HOSPITAL_NAME}</h2>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">{HOSPITAL_ADDRESS}</p>
                  <p className="text-xs text-muted-foreground">Tel: {HOSPITAL_PHONE}</p>
                  <p className="text-xs text-muted-foreground">GST: {HOSPITAL_GST}</p>
                </div>

                <div className="text-center mb-4">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">Tax Invoice / Receipt</p>
                </div>

                {/* Bill Meta */}
                <div className="flex justify-between text-xs text-muted-foreground mb-3">
                  <div>
                    <p><span className="font-medium">Order ID:</span> {receipt.orderId.slice(-8)}</p>
                    <p><span className="font-medium">Patient:</span> {receipt.patientName}</p>
                  </div>
                  <div className="text-right">
                    <p>{receipt.date}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-dashed pt-3 mb-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                    <span className="flex-1">Item</span>
                    <span className="mr-8">Qty × Rate</span>
                    <span>Amount</span>
                  </div>
                  {receipt.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs gap-2">
                      <span className="flex-1 leading-tight text-foreground">{item.name.split(" ").slice(0,3).join(" ")}</span>
                      <span className="text-muted-foreground shrink-0">{item.qty} × ₹{item.price.toFixed(2)}</span>
                      <span className="ml-2 font-medium shrink-0">₹{(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-dashed pt-3 mb-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{receipt.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST (Incl.)</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-base font-bold mt-1 text-primary">
                    <span>Total Paid</span>
                    <span>₹{receipt.total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mb-2">Thank you for choosing {HOSPITAL_NAME}!</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" /> Save PDF
                </Button>
                <Button size="sm" className="flex-1 gap-1" onClick={() => { navigate("/delivery"); setReceipt(null); }}>
                  Track Order
                </Button>
                <Button variant="ghost" size="sm" className="px-2" onClick={() => setReceipt(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PharmacyPage;
