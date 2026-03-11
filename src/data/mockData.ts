export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  avatar?: string;
  availableDays: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  type: "in-person" | "telemedicine";
  queueNumber?: number;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
  description: string;
}

export interface MedicineRequest {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  advancePaid: number;
  status: "pending" | "approved" | "ordered" | "arrived" | "rejected";
  date: string;
}

export interface DeliveryOrder {
  id: string;
  patientId: string;
  patientName: string;
  medicines: { name: string; qty: number; price: number }[];
  address: string;
  distance: number;
  status: "processing" | "dispatched" | "delivered" | "cancelled";
  estimatedTime: string;
  date: string;
}

// Mock data
export const MOCK_DOCTORS: Doctor[] = [
  { id: "1", name: "Dr. Prashanth Reddy", specialty: "General Physician", email: "doctor@srivasudeva.com", phone: "+1-555-0000", availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "a1", patientId: "3", patientName: "John Patient", doctorId: "1", doctorName: "Dr. Prashanth Reddy", date: "2026-03-12", time: "09:00", status: "scheduled", type: "in-person", queueNumber: 1 },
  { id: "a2", patientId: "p2", patientName: "Jane Smith", doctorId: "1", doctorName: "Dr. Prashanth Reddy", date: "2026-03-12", time: "09:30", status: "scheduled", type: "telemedicine", queueNumber: 2 },
];

export const MOCK_MEDICINES: Medicine[] = [
  { id: "m1", name: "Paracetamol 500mg", category: "Pain Relief", price: 5.99, stock: 150, available: true, description: "For fever and mild pain relief" },
  { id: "m2", name: "Amoxicillin 250mg", category: "Antibiotics", price: 12.99, stock: 80, available: true, description: "Broad-spectrum antibiotic" },
  { id: "m3", name: "Ibuprofen 400mg", category: "Pain Relief", price: 7.49, stock: 0, available: false, description: "Anti-inflammatory pain relief" },
  { id: "m4", name: "Omeprazole 20mg", category: "Gastrointestinal", price: 15.99, stock: 45, available: true, description: "Proton pump inhibitor" },
  { id: "m5", name: "Cetirizine 10mg", category: "Antihistamine", price: 8.99, stock: 200, available: true, description: "Allergy relief medication" },
  { id: "m6", name: "Metformin 500mg", category: "Diabetes", price: 9.49, stock: 120, available: true, description: "Blood sugar management" },
];

export const MOCK_REQUESTS: MedicineRequest[] = [
  { id: "r1", patientId: "3", patientName: "John Patient", medicineName: "Specialized Cream XR", advancePaid: 25, status: "pending", date: "2026-03-10" },
  { id: "r2", patientId: "p2", patientName: "Jane Smith", medicineName: "Vitamin D3 5000IU", advancePaid: 15, status: "approved", date: "2026-03-09" },
];

export const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [
  { id: "do1", patientId: "3", patientName: "John Patient", medicines: [{ name: "Paracetamol 500mg", qty: 2, price: 5.99 }], address: "123 Main St", distance: 3.2, status: "dispatched", estimatedTime: "20 min", date: "2026-03-11" },
];
