import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Doctor, Appointment, Medicine, MedicineRequest, DeliveryOrder } from '@/data/mockData';

export const useAppQuery = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appUsers, setAppUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mapAppointments = (data: any[]): Appointment[] =>
    data.map(a => ({
      id: a.id, patientId: a.patient_id, patientName: a.patient_name,
      doctorId: a.doctor_id, doctorName: a.doctor_name, date: a.date,
      time: a.time, status: a.status, type: a.type, queueNumber: a.queue_number
    }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [
      { data: aptsData },
      { data: medsData },
      { data: reqsData },
      { data: delData },
      { data: docsData },
      { data: usersData }
    ] = await Promise.all([
      supabase.from('appointments').select('*').order('date', { ascending: true }),
      supabase.from('medicines').select('*'),
      supabase.from('medicine_requests').select('*').order('date', { ascending: false }),
      supabase.from('delivery_orders').select('*').order('date', { ascending: false }),
      supabase.from('doctors').select('*'),
      supabase.from('app_users').select('*')
    ]);

    if (aptsData) setAppointments(mapAppointments(aptsData));
    if (medsData) setMedicines(medsData as Medicine[]);
    if (reqsData) {
      setRequests(reqsData.map(r => ({
        id: r.id, patientId: r.patient_id, patientName: r.patient_name,
        medicineName: r.medicine_name, advancePaid: r.advance_paid,
        status: r.status, date: r.date
      })));
    }
    if (delData) {
      setDeliveryOrders(delData.map(d => ({
        id: d.id, patientId: d.patient_id, patientName: d.patient_name,
        medicines: d.medicines || [],
        address: d.address, distance: d.distance, status: d.status,
        estimatedTime: d.estimated_time, date: d.date
      })));
    }
    if (docsData) {
      setDoctors(docsData.map(d => ({
        id: d.id, name: d.name, specialty: d.specialty, email: d.email, phone: d.phone,
        avatar: d.avatar, availableDays: d.available_days || []
      })));
    }
    if (usersData) setAppUsers(usersData);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    const aptsChannel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
        const { data } = await supabase.from('appointments').select('*').order('date', { ascending: true });
        if (data) setAppointments(mapAppointments(data));
      })
      .subscribe();

    const reqsChannel = supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medicine_requests' }, async () => {
        const { data } = await supabase.from('medicine_requests').select('*').order('date', { ascending: false });
        if (data) setRequests(data.map(r => ({
          id: r.id, patientId: r.patient_id, patientName: r.patient_name,
          medicineName: r.medicine_name, advancePaid: r.advance_paid,
          status: r.status, date: r.date
        })));
      })
      .subscribe();

    const delChannel = supabase
      .channel('delivery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_orders' }, async () => {
        const { data } = await supabase.from('delivery_orders').select('*').order('date', { ascending: false });
        if (data) setDeliveryOrders(data.map(d => ({
          id: d.id, patientId: d.patient_id, patientName: d.patient_name,
          medicines: d.medicines || [],
          address: d.address, distance: d.distance, status: d.status,
          estimatedTime: d.estimated_time, date: d.date
        })));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(aptsChannel);
      supabase.removeChannel(reqsChannel);
      supabase.removeChannel(delChannel);
    };
  }, [fetchData]);

  return { appointments, medicines, requests, deliveryOrders, doctors, appUsers, loading, refetch: fetchData };
};
