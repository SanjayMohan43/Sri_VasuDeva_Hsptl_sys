import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "@/components/StatsCard";
import { Calendar, Users, Pill, ClipboardList, Stethoscope, Package, TruckIcon, Video, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAppQuery } from "@/hooks/useAppQuery";
import { Appointment, Medicine, MedicineRequest, DeliveryOrder } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const getEffectiveStatus = (apt: Appointment): string => {
  if (apt.status !== "scheduled") return apt.status;
  const timeParts = apt.time.split(':');
  const timeStr = timeParts.length === 2 ? `${apt.time}:00` : apt.time;
  const aptDateTime = new Date(`${apt.date}T${timeStr}`);
  return (isNaN(aptDateTime.getTime()) || aptDateTime < new Date()) ? "missed" : "upcoming";
};

const statusBadgeClass = (s: string) => {
  if (s === "visited" || s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "in-progress") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "missed") return "bg-orange-50 text-orange-700 border-orange-200";
  if (s === "cancelled") return "bg-red-50 text-red-700 border-red-200";
  return "";
};

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

import { useHospital } from "@/contexts/HospitalContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminDashboard = ({ appointments, medicines, requests, deliveryOrders, doctors }: { appointments: Appointment[], medicines: Medicine[], requests: MedicineRequest[], deliveryOrders: DeliveryOrder[], doctors: any[] }) => {
  const { isOpen, toggleHospital } = useHospital();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Appointments" value={appointments.length} icon={<Calendar className="h-5 w-5" />} trend={{ value: 12, positive: true }} description="Past 30 days" />
        <StatsCard title="Active Doctors" value={doctors.length} icon={<Stethoscope className="h-5 w-5" />} description="All specialties" />
        <StatsCard title="Medicine Stock" value={medicines.filter(m => m.available).length + "/" + medicines.length} icon={<Pill className="h-5 w-5" />} description="Available items" />
        <Card className="shadow-card border-0 flex flex-col justify-center px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Hospital Status</span>
            <Badge variant={isOpen ? "default" : "destructive"}>{isOpen ? "Open" : "Closed"}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="hospital-status" 
              checked={isOpen} 
              onCheckedChange={toggleHospital} 
            />
            <Label htmlFor="hospital-status" className="text-xs text-muted-foreground">
              {isOpen ? "Toggle to close" : "Toggle to open"}
            </Label>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Appointments</CardTitle>
              <Badge variant="outline">{appointments.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Patient</th>
                    <th className="text-left pb-2 font-medium">Doctor</th>
                    <th className="text-left pb-2 font-medium">Time/Date</th>
                    <th className="text-right pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appointments.slice(0, 5).map(apt => {
                    const eff = getEffectiveStatus(apt);
                    return (
                      <tr key={apt.id} className="group hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-medium text-foreground">{apt.patientName}</td>
                        <td className="py-3 text-muted-foreground">{apt.doctorName}</td>
                        <td className="py-3 text-muted-foreground text-xs leading-tight">
                          {apt.date}<br/>{apt.time}
                        </td>
                        <td className="py-3 text-right">
                          <Badge variant="outline" className={`text-[10px] h-5 border capitalize ${statusBadgeClass(eff)}`}>
                            {eff}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {appointments.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No appointments found</p>}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-lg">Active Deliveries</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {deliveryOrders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-sm text-foreground">{order.patientName}</p>
                  <p className="text-xs text-muted-foreground">{order.address} · {order.estimatedTime}</p>
                </div>
                <Badge className="text-[10px] h-5">{order.status}</Badge>
              </div>
            ))}
            {deliveryOrders.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No active deliveries</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const DoctorDashboard = ({ appointments }: { appointments: Appointment[] }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
      <StatsCard title="Today's Appointments" value={appointments.length} icon={<Calendar className="h-5 w-5" />} description={`${appointments.filter(a => a.type === 'in-person').length} in-person, ${appointments.filter(a => a.type === 'telemedicine').length} virtual`} />
      <StatsCard title="Queue Length" value={appointments.filter(a => a.status === 'scheduled').length} icon={<ClipboardList className="h-5 w-5" />} description="Patients waiting" />
      <StatsCard title="Telemedicine" value={appointments.filter(a => a.type === 'telemedicine').length} icon={<Video className="h-5 w-5" />} description="Upcoming session" />
    </div>
    <Card className="shadow-card border-0">
      <CardHeader><CardTitle className="text-lg">Upcoming Appointments</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {appointments.map(apt => (
          <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-sm text-foreground">{apt.patientName}</p>
              <p className="text-xs text-muted-foreground">{apt.date} · {apt.time}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={apt.type === "telemedicine" ? "outline" : "secondary"}>{apt.type}</Badge>
              <Badge variant={apt.status === "in-progress" ? "default" : "secondary"}>{apt.status}</Badge>
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="text-sm text-muted-foreground">No upcoming appointments</p>}
      </CardContent>
    </Card>
  </>
);

const PatientDashboard = ({ appointments, requests, deliveryOrders, user }: { appointments: Appointment[], requests: MedicineRequest[], deliveryOrders: DeliveryOrder[], user: any }) => {
  const myAppointments = appointments.filter(a => a.patientId === user.id);
  const myDeliveries = deliveryOrders.filter(o => o.patientId === user.id);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard title="My Appointments" value={myAppointments.length} icon={<Calendar className="h-5 w-5" />} description="Upcoming" />
        <StatsCard title="Queue Position" value={myAppointments.length > 0 ? `#${myAppointments[0].queueNumber || 1}` : '-'} icon={<ClipboardList className="h-5 w-5" />} description={myAppointments.length > 0 ? myAppointments[0].doctorName : 'None currently'} />
        <StatsCard title="Medicine Orders" value={myDeliveries.length} icon={<TruckIcon className="h-5 w-5" />} description={myDeliveries.length > 0 ? "In transit" : "None active"} />
        <StatsCard title="Medicine Requests" value={requests.filter(r => r.patientId === user.id).length} icon={<Package className="h-5 w-5" />} description="Total requests" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-lg">My Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {myAppointments.map(apt => {
              const eff = getEffectiveStatus(apt);
              return (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} · {apt.time}</p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap justify-end">
                    {apt.type === "telemedicine" && <Badge variant="outline">Virtual</Badge>}
                    {apt.queueNumber && eff === "upcoming" && <Badge>Q#{apt.queueNumber}</Badge>}
                    <Badge variant="outline" className={`text-[10px] capitalize border ${statusBadgeClass(eff)}`}>
                      {eff}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {myAppointments.length === 0 && <p className="text-sm text-muted-foreground">No upcoming appointments</p>}
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-lg">Delivery Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {myDeliveries.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-secondary/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-sm text-foreground">Order #{order.id}</p>
                  <Badge>{order.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">ETA: {order.estimatedTime} · {order.distance} km away</p>
              </div>
            ))}
            {myDeliveries.length === 0 && <p className="text-sm text-muted-foreground">No active deliveries</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { appointments, medicines, requests, deliveryOrders, doctors, loading } = useAppQuery();

  if (!user) return null;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleLabels = { admin: "Admin", doctor: "Doctor", patient: "Patient" };

  return (
    <motion.div {...fadeIn}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-1">{roleLabels[user.role as keyof typeof roleLabels]} Dashboard · Supabase Connected</p>
      </div>
      {user.role === "admin" && <AdminDashboard appointments={appointments} medicines={medicines} requests={requests} deliveryOrders={deliveryOrders} doctors={doctors} />}
      {user.role === "doctor" && <DoctorDashboard appointments={appointments.filter(a => a.doctorId === user.id || a.doctorName.includes(user.name.split(' ')[1]))} />}
      {user.role === "patient" && <PatientDashboard appointments={appointments} requests={requests} deliveryOrders={deliveryOrders} user={user} />}
    </motion.div>
  );
};

export default DashboardPage;
