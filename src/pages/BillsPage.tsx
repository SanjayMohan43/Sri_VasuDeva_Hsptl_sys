import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, X, Loader2, FileText, CheckCircle2, Printer, Download } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface BillItem {
  name: string;
  qty: number;
  price: number;
}

interface Bill {
  id: string;
  order_id: string;
  patient_id: string;
  patient_name: string;
  items: BillItem[];
  subtotal: number;
  total: number;
  created_at: string;
  hospital_name: string;
  hospital_address: string;
}

const HOSPITAL_PHONE = "+91-98765-00000";
const HOSPITAL_GST  = "36XXXXX1234Z1";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const BillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      let query = supabase.from('bills').select('*').order('created_at', { ascending: false });
      if (user?.role === "patient") {
        query = query.eq('patient_id', user.id);
      }
      const { data, error } = await query;
      if (error) {
        toast.error("Failed to load bills");
        console.error(error);
      } else {
        setBills((data || []) as Bill[]);
      }
      setLoading(false);
    };

    fetchBills();

    // Real-time: new bill appears instantly
    const channel = supabase
      .channel('bills-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bills' }, (payload) => {
        const newBill = payload.new as Bill;
        if (user?.role === "admin" || newBill.patient_id === user?.id) {
          setBills(prev => [newBill, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleDownloadPDF = async () => {
    const input = document.getElementById("receipt-content");
    if (!input) return;

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Center the image horizontally and vertically if it's smaller, or just top-align it. 
      // Top align looks best for receipts. Added a slight 10mm margin.
      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, (pdfWidth - 20) * (canvas.height / canvas.width));
      pdf.save(`Receipt_${selectedBill?.order_id || Date.now()}.pdf`);
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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Receipt className="h-8 w-8 text-primary" />
          {user?.role === "admin" ? "All Bills & Receipts" : "My Bills & Receipts"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "admin"
            ? "View and manage all patient billing records"
            : "All your pharmacy purchase receipts saved here"}
        </p>
      </div>

      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/30 rounded-2xl border-2 border-dashed border-muted">
          <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-40" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No bills yet</h3>
          <p className="text-muted-foreground">Bills will appear here after each pharmacy checkout.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill, i) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="shadow-card border-0 hover:shadow-elevated transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Bill info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Receipt className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground text-sm">
                            Order #{bill.order_id.slice(-10)}
                          </p>
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50">
                            Paid
                          </Badge>
                        </div>
                        {user?.role === "admin" && (
                          <p className="text-xs text-muted-foreground mt-0.5">Patient: {bill.patient_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(bill.created_at)} · {bill.items.length} item{bill.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Right: Total + action */}
                    <div className="flex items-center gap-4 sm:ml-auto">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Paid</p>
                        <p className="text-xl font-bold text-foreground">₹{Number(bill.total).toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 shrink-0"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <Printer className="h-4 w-4" />
                        View Receipt
                      </Button>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {bill.items.map((item, j) => (
                        <span key={j} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                          {item.name.split(" ").slice(0, 2).join(" ")} ×{item.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedBill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedBill(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-card text-foreground rounded-2xl shadow-2xl max-w-sm w-full p-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div id="receipt-content" className="bg-white p-4 -m-4 mb-2 rounded-xl">
                {/* Header */}
                <div className="text-center mb-4 pb-4 border-b border-dashed">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <h2 className="text-lg font-bold">{selectedBill.hospital_name}</h2>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">{selectedBill.hospital_address}</p>
                  <p className="text-xs text-muted-foreground">Tel: {HOSPITAL_PHONE}</p>
                  <p className="text-xs text-muted-foreground">GST: {HOSPITAL_GST}</p>
                </div>

                <div className="text-center mb-4">
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">Tax Invoice / Receipt</p>
                </div>

                {/* Meta */}
                <div className="flex justify-between text-xs text-muted-foreground mb-3">
                  <div>
                    <p><span className="font-medium">Bill ID:</span> {selectedBill.id.slice(-10)}</p>
                    <p><span className="font-medium">Order:</span> {selectedBill.order_id.slice(-10)}</p>
                    <p><span className="font-medium">Patient:</span> {selectedBill.patient_name}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatDate(selectedBill.created_at)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-dashed pt-3 mb-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                    <span className="flex-1">Item</span>
                    <span className="mr-4">Qty × Rate</span>
                    <span>Amt</span>
                  </div>
                  {selectedBill.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs gap-2">
                      <span className="flex-1 leading-tight text-foreground">{item.name.split(" ").slice(0, 3).join(" ")}</span>
                      <span className="text-muted-foreground shrink-0">{item.qty} × ₹{Number(item.price).toFixed(2)}</span>
                      <span className="font-medium shrink-0 ml-2">₹{(item.qty * Number(item.price)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-dashed pt-3 mb-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedBill.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST (Incl.)</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-primary">
                    <span>Total Paid</span>
                    <span>₹{Number(selectedBill.total).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mb-2">
                  Thank you for choosing {selectedBill.hospital_name}!
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" /> Save PDF
                </Button>
                <Button className="flex-1 gap-2" onClick={() => setSelectedBill(null)}>
                  <X className="h-4 w-4" /> Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BillsPage;
