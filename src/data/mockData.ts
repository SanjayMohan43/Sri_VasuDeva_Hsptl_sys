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
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed" | "visited";
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
  { id: "1", name: "Dr. Prashanth Reddy", specialty: "General Physician", email: "doctor@srivasudeva.com", phone: "+91-98765-00000", availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "a1", patientId: "3", patientName: "John Patient", doctorId: "1", doctorName: "Dr. Prashanth Reddy", date: "2026-03-12", time: "09:00", status: "scheduled", type: "in-person", queueNumber: 1 },
  { id: "a2", patientId: "p2", patientName: "Jane Smith", doctorId: "1", doctorName: "Dr. Prashanth Reddy", date: "2026-03-12", time: "09:30", status: "scheduled", type: "telemedicine", queueNumber: 2 },
];

export const MOCK_MEDICINES: Medicine[] = [
  // Pain Relief & Anti-inflammatory
  { id: "m1", name: "Paracetamol (Acetaminophen) 500mg", category: "Pain Relief", price: 5.99, stock: 150, available: true, description: "Analgesic & antipyretic. C₈H₉NO₂. Adults: 500–1000mg every 4–6 hrs. Max 4g/day." },
  { id: "m2", name: "Ibuprofen 400mg", category: "Pain Relief / NSAID", price: 7.49, stock: 0, available: false, description: "NSAID. C₁₃H₁₈O₂. For pain, fever, inflammation. 400mg 3× daily with food." },
  { id: "m3", name: "Diclofenac Sodium 50mg", category: "Pain Relief / NSAID", price: 9.99, stock: 80, available: true, description: "NSAID. C₁₄H₁₁Cl₂NO₂Na. For arthritis, pain, migraine. 50mg 2–3× daily after meals." },
  { id: "m4", name: "Aspirin (Acetylsalicylic Acid) 75mg", category: "Antiplatelet / Pain Relief", price: 4.49, stock: 200, available: true, description: "Antiplatelet & analgesic. C₉H₈O₄. 75mg once daily for cardiac prophylaxis." },
  { id: "m5", name: "Tramadol HCl 50mg", category: "Opioid Analgesic", price: 14.99, stock: 0, available: false, description: "Opioid analgesic. C₁₆H₂₅NO₂·HCl. Severe pain. 50–100mg every 4–6 hrs. Rx required." },
  { id: "m6", name: "Naproxen Sodium 550mg", category: "Pain Relief / NSAID", price: 11.99, stock: 60, available: true, description: "NSAID. C₁₄H₁₄O₃. For arthritis, menstrual cramps. 550mg twice daily with food." },

  // Antibiotics
  { id: "m7", name: "Amoxicillin 500mg", category: "Antibiotic", price: 15.99, stock: 90, available: true, description: "Aminopenicillin. C₁₆H₁₉N₃O₅S. Broad-spectrum. 500mg every 8 hrs for 5–7 days." },
  { id: "m8", name: "Azithromycin 500mg", category: "Antibiotic (Macrolide)", price: 22.99, stock: 55, available: true, description: "Macrolide antibiotic. C₃₈H₇₂N₂O₁₂. 500mg on day 1, then 250mg days 2–5." },
  { id: "m9", name: "Ciprofloxacin 500mg", category: "Antibiotic (Fluoroquinolone)", price: 18.49, stock: 70, available: true, description: "Fluoroquinolone. C₁₇H₁₈FN₃O₃. UTI, GI infections. 500mg twice daily for 7–10 days." },
  { id: "m10", name: "Doxycycline Hyclate 100mg", category: "Antibiotic (Tetracycline)", price: 19.99, stock: 45, available: true, description: "Tetracycline. C₂₂H₂₄N₂O₈·HCl. 100mg twice daily. Take with full glass of water." },
  { id: "m11", name: "Metronidazole 400mg", category: "Antibiotic / Antiprotozoal", price: 8.99, stock: 110, available: true, description: "Nitroimidazole. C₆H₉N₃O₃. Anaerobic infections, H. pylori. 400mg 3× daily." },
  { id: "m12", name: "Cefixime 200mg", category: "Antibiotic (Cephalosporin)", price: 24.99, stock: 0, available: false, description: "3rd-gen cephalosporin. C₁₆H₁₅N₅O₇S₂. 200mg twice daily or 400mg once daily." },
  { id: "m13", name: "Clindamycin 300mg", category: "Antibiotic (Lincosamide)", price: 28.99, stock: 35, available: true, description: "Lincosamide. C₁₈H₃₃ClN₂O₅S. Skin/soft tissue infections. 300mg every 6–8 hrs." },

  // Gastrointestinal
  { id: "m14", name: "Omeprazole 20mg", category: "Gastrointestinal (PPI)", price: 13.99, stock: 130, available: true, description: "Proton pump inhibitor. C₁₇H₁₉N₃O₃S. GERD, ulcers. 20mg once daily before breakfast." },
  { id: "m15", name: "Pantoprazole 40mg", category: "Gastrointestinal (PPI)", price: 16.49, stock: 95, available: true, description: "PPI. C₁₆H₁₅F₂N₃O₄S. Acid reflux, Zollinger-Ellison. 40mg once daily before meal." },
  { id: "m16", name: "Ranitidine 150mg", category: "Gastrointestinal (H2 Blocker)", price: 7.99, stock: 0, available: false, description: "H2 receptor blocker. C₁₃H₂₂N₄O₃S. 150mg twice daily for peptic ulcers." },
  { id: "m17", name: "Domperidone 10mg", category: "Gastrointestinal (Prokinetic)", price: 6.49, stock: 160, available: true, description: "Antiemetic/prokinetic. C₂₂H₂₄ClN₅O₂. Nausea, vomiting. 10mg 3× daily before meals." },
  { id: "m18", name: "Ondansetron 4mg", category: "Antiemetic", price: 19.99, stock: 50, available: true, description: "5-HT3 antagonist. C₁₈H₁₉N₃O·HCl. Nausea/vomiting. 4–8mg 3× daily." },
  { id: "m19", name: "Loperamide 2mg", category: "Antidiarrheal", price: 5.49, stock: 180, available: true, description: "Opioid agonist (GI). C₂₉H₃₃ClN₂O₂. Acute diarrhea. 2mg after each loose stool. Max 16mg/day." },

  // Cardiovascular
  { id: "m20", name: "Amlodipine Besylate 5mg", category: "Cardiovascular (CCB)", price: 12.99, stock: 140, available: true, description: "Calcium channel blocker. C₂₀H₂₅ClN₂O₅·C₆H₇O₆S. Hypertension, angina. 5–10mg once daily." },
  { id: "m21", name: "Atorvastatin 10mg", category: "Cardiovascular (Statin)", price: 18.99, stock: 120, available: true, description: "HMG-CoA reductase inhibitor. C₃₃H₃₅FN₂O₅. Cholesterol. 10–80mg once daily at night." },
  { id: "m22", name: "Metoprolol Succinate 25mg", category: "Cardiovascular (Beta-Blocker)", price: 14.49, stock: 75, available: true, description: "Beta-1 selective blocker. C₁₅H₂₅NO₃·C₄H₆O₄. Hypertension, heart failure. 25–200mg/day." },
  { id: "m23", name: "Losartan Potassium 50mg", category: "Cardiovascular (ARB)", price: 21.99, stock: 85, available: true, description: "Angiotensin II receptor blocker. C₂₂H₂₂ClKN₆O. Hypertension. 50mg once daily." },
  { id: "m24", name: "Furosemide 40mg", category: "Diuretic (Loop)", price: 8.49, stock: 0, available: false, description: "Loop diuretic. C₁₂H₁₁ClN₂O₅S. Edema, heart failure. 40mg once daily in morning." },
  { id: "m25", name: "Clopidogrel 75mg", category: "Antiplatelet", price: 29.99, stock: 65, available: true, description: "P2Y12 inhibitor. C₁₆H₁₆ClNO₂S. Post-MI, stroke prevention. 75mg once daily." },

  // Diabetes
  { id: "m26", name: "Metformin HCl 500mg", category: "Antidiabetic (Biguanide)", price: 9.49, stock: 200, available: true, description: "Insulin sensitizer. C₄H₁₁N₅·HCl. Type 2 DM. 500mg 2–3× daily with meals." },
  { id: "m27", name: "Glibenclamide (Glyburide) 5mg", category: "Antidiabetic (Sulfonylurea)", price: 7.99, stock: 110, available: true, description: "Sulfonylurea. C₂₃H₂₈ClN₃O₅S. Type 2 DM. 5mg once daily before breakfast." },
  { id: "m28", name: "Sitagliptin 100mg", category: "Antidiabetic (DPP-4 Inhibitor)", price: 45.99, stock: 40, available: true, description: "DPP-4 inhibitor. C₁₆H₁₅F₆N₅O. Type 2 DM. 100mg once daily with or without food." },
  { id: "m29", name: "Insulin Glargine 100 IU/mL", category: "Antidiabetic (Insulin)", price: 89.99, stock: 25, available: true, description: "Long-acting insulin analog. Dose individualized. SC injection once daily at same time." },

  // Respiratory
  { id: "m30", name: "Salbutamol (Albuterol) 100mcg Inhaler", category: "Respiratory (SABA)", price: 24.99, stock: 60, available: true, description: "Short-acting β2 agonist. C₁₃H₂₁NO₃. Asthma relief. 100–200mcg per puff, 2–4× daily." },
  { id: "m31", name: "Budesonide 200mcg Inhaler", category: "Respiratory (ICS)", price: 39.99, stock: 45, available: true, description: "Inhaled corticosteroid. C₂₅H₃₄O₆. Asthma control. 200–400mcg twice daily." },
  { id: "m32", name: "Montelukast Sodium 10mg", category: "Respiratory (Leukotriene Antagonist)", price: 22.49, stock: 80, available: true, description: "Leukotriene receptor antagonist. C₃₅H₃₆ClNO₃S·Na. Asthma, allergic rhinitis. 10mg at night." },
  { id: "m33", name: "Theophylline 200mg", category: "Respiratory (Bronchodilator)", price: 11.99, stock: 0, available: false, description: "Methylxanthine. C₇H₈N₄O₂. Chronic asthma/COPD. 200–400mg twice daily (extended release)." },
  { id: "m34", name: "Dextromethorphan 15mg + Guaifenesin 100mg", category: "Cough / Expectorant", price: 8.99, stock: 150, available: true, description: "Antitussive + expectorant. C₁₈H₂₅NO + C₁₀H₁₄O₄. Dry/productive cough. 1–2 tablets every 4–6 hrs." },

  // Antihistamines / Allergy
  { id: "m35", name: "Cetirizine HCl 10mg", category: "Antihistamine (2nd Gen)", price: 6.99, stock: 200, available: true, description: "H1 antihistamine. C₂₁H₂₅ClN₂O₃·2HCl. Allergic rhinitis, urticaria. 10mg once daily." },
  { id: "m36", name: "Loratadine 10mg", category: "Antihistamine (2nd Gen)", price: 6.49, stock: 190, available: true, description: "Non-sedating H1 blocker. C₂₂H₂₃ClN₂O₂. Seasonal allergies. 10mg once daily." },
  { id: "m37", name: "Fexofenadine HCl 120mg", category: "Antihistamine (2nd Gen)", price: 12.99, stock: 100, available: true, description: "H1 antagonist. C₃₂H₃₉NO₄. Allergic rhinitis, hives. 120mg once daily or 180mg once daily." },
  { id: "m38", name: "Chlorpheniramine Maleate 4mg", category: "Antihistamine (1st Gen)", price: 3.99, stock: 170, available: true, description: "H1 blocker (sedating). C₁₆H₁₉ClN₂. Allergies, cold. 4mg 3–4× daily. Causes drowsiness." },

  // Vitamins & Supplements
  { id: "m39", name: "Vitamin D3 (Cholecalciferol) 1000 IU", category: "Vitamins & Supplements", price: 8.99, stock: 250, available: true, description: "Fat-soluble vitamin. C₂₇H₄₄O. Bone health, immunity. 1000–2000 IU once daily with fatty meal." },
  { id: "m40", name: "Vitamin B12 (Cyanocobalamin) 500mcg", category: "Vitamins & Supplements", price: 7.49, stock: 200, available: true, description: "Water-soluble vitamin. C₆₃H₈₈CoN₁₄O₁₄P. Nerve health, anemia. 500mcg once daily." },
  { id: "m41", name: "Folic Acid (Vitamin B9) 5mg", category: "Vitamins & Supplements", price: 4.99, stock: 300, available: true, description: "B-vitamin. C₁₉H₁₉N₇O₆. Pregnancy, megaloblastic anemia. 5mg once daily." },
  { id: "m42", name: "Ferrous Sulfate 200mg (Iron 65mg)", category: "Vitamins & Supplements", price: 5.99, stock: 180, available: true, description: "Iron supplement. FeSO₄. Iron-deficiency anemia. 200mg 2–3× daily on empty stomach." },
  { id: "m43", name: "Calcium Carbonate 500mg + Vitamin D3 250 IU", category: "Vitamins & Supplements", price: 9.99, stock: 160, available: true, description: "Calcium + D3 combination. CaCO₃. Bone health, osteoporosis prevention. 1–2 tablets 3× daily." },
  { id: "m44", name: "Zinc Sulfate 220mg", category: "Vitamins & Supplements", price: 6.99, stock: 120, available: true, description: "Trace mineral. ZnSO₄·7H₂O. Immunity, wound healing. 220mg once daily with food." },
  { id: "m45", name: "Omega-3 Fish Oil 1000mg", category: "Vitamins & Supplements", price: 11.99, stock: 140, available: true, description: "EPA + DHA fatty acids. Cardiovascular, anti-inflammatory. 1–2 capsules daily with food." },

  // Thyroid
  { id: "m46", name: "Levothyroxine Sodium 50mcg", category: "Thyroid", price: 10.99, stock: 100, available: true, description: "Synthetic T4. C₁₅H₁₀I₄NNaO₄. Hypothyroidism. 50–200mcg once daily on empty stomach." },
  { id: "m47", name: "Carbimazole 5mg", category: "Thyroid (Antithyroid)", price: 12.49, stock: 0, available: false, description: "Antithyroid agent. C₇H₁₀N₂OS. Hyperthyroidism. 5–60mg/day in divided doses." },

  // Neurological / Psychiatric
  { id: "m48", name: "Sertraline HCl 50mg", category: "Antidepressant (SSRI)", price: 27.99, stock: 55, available: true, description: "SSRI. C₁₇H₁₇Cl₂N·HCl. Depression, anxiety, OCD. 50–200mg once daily. Rx required." },
  { id: "m49", name: "Escitalopram Oxalate 10mg", category: "Antidepressant (SSRI)", price: 31.99, stock: 50, available: true, description: "SSRI. C₂₀H₂₁FN₂O·C₂H₂O₄. Depression, GAD. 10–20mg once daily. Rx required." },
  { id: "m50", name: "Alprazolam 0.25mg", category: "Anxiolytic (Benzodiazepine)", price: 9.99, stock: 0, available: false, description: "BZD. C₁₇H₁₃ClN₄. Anxiety disorders. 0.25–0.5mg 3× daily. Rx mandatory. Habit-forming." },
  { id: "m51", name: "Clonazepam 0.5mg", category: "Anxiolytic / Anticonvulsant", price: 11.49, stock: 0, available: false, description: "BZD. C₁₅H₁₀ClN₃O₃. Epilepsy, panic disorder. 0.5mg twice daily. Rx required." },
  { id: "m52", name: "Gabapentin 300mg", category: "Anticonvulsant / Neuropathic Pain", price: 23.99, stock: 60, available: true, description: "Anticonvulsant. C₉H₁₇NO₂. Epilepsy, neuropathic pain. 300mg 3× daily. Rx required." },

  // Antifungal / Antiviral
  { id: "m53", name: "Fluconazole 150mg", category: "Antifungal", price: 16.99, stock: 70, available: true, description: "Triazole antifungal. C₁₃H₁₂F₂N₆O. Candidal infections. Single 150mg dose for vaginal candidiasis." },
  { id: "m54", name: "Clotrimazole 1% Cream 20g", category: "Antifungal (Topical)", price: 7.99, stock: 130, available: true, description: "Imidazole antifungal. C₂₂H₁₇ClN₂. Skin/nail fungal infections. Apply 2–3× daily for 2–4 weeks." },
  { id: "m55", name: "Acyclovir 200mg", category: "Antiviral", price: 13.49, stock: 45, available: true, description: "Nucleoside analog. C₈H₁₁N₅O₃. Herpes simplex, Herpes zoster. 200mg 5× daily for 5–10 days." },

  // Dermatology / Topical
  { id: "m56", name: "Hydrocortisone 1% Cream 15g", category: "Topical Corticosteroid", price: 8.49, stock: 100, available: true, description: "Topical corticosteroid. C₂₁H₃₀O₅. Eczema, dermatitis, rashes. Apply thin layer 2–4× daily." },
  { id: "m57", name: "Betamethasone 0.05% Cream 15g", category: "Topical Corticosteroid (Potent)", price: 10.99, stock: 0, available: false, description: "Potent corticosteroid. C₂₂H₂₉FO₅. Psoriasis, severe eczema. Apply sparingly once/twice daily." },
  { id: "m58", name: "Mupirocin 2% Ointment 5g", category: "Topical Antibiotic", price: 12.99, stock: 80, available: true, description: "Topical antibiotic. C₂₆H₄₄O₉. Impetigo, skin infections (MRSA). Apply 3× daily for 5–10 days." },

  // Urology
  { id: "m59", name: "Tamsulosin HCl 0.4mg", category: "Urology (Alpha-Blocker)", price: 19.99, stock: 55, available: true, description: "Alpha-1 blocker. C₂₀H₂₈N₂O₅S·HCl. BPH. 0.4mg once daily 30 min after same meal each day." },
  { id: "m60", name: "Oxybutynin 5mg", category: "Urology (Anticholinergic)", price: 14.49, stock: 40, available: true, description: "Anticholinergic. C₂₂H₃₁NO₃·HCl. Overactive bladder. 5mg 2–3× daily." },

  // Eye / Ear Drops
  { id: "m61", name: "Ciprofloxacin Eye Drops 0.3% 5mL", category: "Ophthalmic Antibiotic", price: 9.99, stock: 60, available: true, description: "Fluoroquinolone. C₁₇H₁₈FN₃O₃. Bacterial conjunctivitis. 1–2 drops every 2–4 hrs for 7 days." },
  { id: "m62", name: "Timolol Maleate Eye Drops 0.5% 5mL", category: "Ophthalmic (Glaucoma)", price: 18.99, stock: 0, available: false, description: "Beta-blocker eye drops. C₁₃H₂₄N₄O₃S. Glaucoma, ocular hypertension. 1 drop twice daily." },
];

export const MOCK_REQUESTS: MedicineRequest[] = [
  { id: "r1", patientId: "3", patientName: "John Patient", medicineName: "Specialized Cream XR", advancePaid: 25, status: "pending", date: "2026-03-10" },
  { id: "r2", patientId: "p2", patientName: "Jane Smith", medicineName: "Vitamin D3 5000IU", advancePaid: 15, status: "approved", date: "2026-03-09" },
];

export const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [
  { id: "do1", patientId: "3", patientName: "John Patient", medicines: [{ name: "Paracetamol 500mg", qty: 2, price: 5.99 }], address: "123 Main St", distance: 3.2, status: "dispatched", estimatedTime: "20 min", date: "2026-03-11" },
];
