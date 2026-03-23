-- ============================================================
-- CareConnect – Database Schema & Seed Script
-- Run this in Supabase SQL Editor to set up the full database
-- ============================================================

-- ─── TABLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient'
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  available_days TEXT[]
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  doctor_id TEXT,
  doctor_name TEXT,
  date TEXT,
  time TEXT,
  status TEXT DEFAULT 'scheduled',
  type TEXT DEFAULT 'in-person',
  queue_number INT
);

CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  stock INT DEFAULT 0,
  available BOOLEAN DEFAULT true,
  description TEXT
);

CREATE TABLE IF NOT EXISTS medicine_requests (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  medicine_name TEXT,
  advance_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  date TEXT
);

CREATE TABLE IF NOT EXISTS delivery_orders (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  medicines JSONB DEFAULT '[]',
  address TEXT,
  distance NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  estimated_time TEXT,
  date TEXT
);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hospital_name TEXT DEFAULT 'Sri VasuDeva Medicals',
  hospital_address TEXT DEFAULT 'Opp to Sanjay Glass Mart, Huzurabad Road, Parkal, Bhupalpally Dist - 506164'
);

-- ─── PATCH EXISTING TABLES (safe to re-run) ──────────────────
-- Adds any columns that may be missing if tables already existed
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS medicines JSONB DEFAULT '[]';
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS patient_id TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS distance NUMERIC DEFAULT 0;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS estimated_time TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS date TEXT;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'in-person';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS queue_number INT;

-- ─── ENABLE REALTIME ─────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE medicine_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_orders;

-- ─── SEED: DOCTORS ───────────────────────────────────────────
INSERT INTO doctors (id, name, specialty, email, phone, available_days) VALUES
  ('doc-1', 'Dr. Prashanth Reddy', 'General Physician', 'doctor@srivasudeva.com', '+91-98765-00000', ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'])
ON CONFLICT (id) DO NOTHING;

-- ─── SEED: MEDICINES (62 medicines) ──────────────────────────
INSERT INTO medicines (id, name, category, price, stock, available, description) VALUES
  ('m1','Paracetamol (Acetaminophen) 500mg','Pain Relief',5.99,150,true,'Analgesic & antipyretic. C₈H₉NO₂. Adults: 500–1000mg every 4–6 hrs. Max 4g/day.'),
  ('m2','Ibuprofen 400mg','Pain Relief / NSAID',7.49,0,false,'NSAID. C₁₃H₁₈O₂. For pain, fever, inflammation. 400mg 3× daily with food.'),
  ('m3','Diclofenac Sodium 50mg','Pain Relief / NSAID',9.99,80,true,'NSAID. C₁₄H₁₁Cl₂NO₂Na. For arthritis, pain, migraine. 50mg 2–3× daily after meals.'),
  ('m4','Aspirin (Acetylsalicylic Acid) 75mg','Antiplatelet / Pain Relief',4.49,200,true,'Antiplatelet & analgesic. C₉H₈O₄. 75mg once daily for cardiac prophylaxis.'),
  ('m5','Tramadol HCl 50mg','Opioid Analgesic',14.99,0,false,'Opioid analgesic. C₁₆H₂₅NO₂·HCl. Severe pain. 50–100mg every 4–6 hrs. Rx required.'),
  ('m6','Naproxen Sodium 550mg','Pain Relief / NSAID',11.99,60,true,'NSAID. C₁₄H₁₄O₃. For arthritis, menstrual cramps. 550mg twice daily with food.'),
  ('m7','Amoxicillin 500mg','Antibiotic',15.99,90,true,'Aminopenicillin. C₁₆H₁₉N₃O₅S. Broad-spectrum. 500mg every 8 hrs for 5–7 days.'),
  ('m8','Azithromycin 500mg','Antibiotic (Macrolide)',22.99,55,true,'Macrolide antibiotic. C₃₈H₇₂N₂O₁₂. 500mg on day 1, then 250mg days 2–5.'),
  ('m9','Ciprofloxacin 500mg','Antibiotic (Fluoroquinolone)',18.49,70,true,'Fluoroquinolone. C₁₇H₁₈FN₃O₃. UTI, GI infections. 500mg twice daily for 7–10 days.'),
  ('m10','Doxycycline Hyclate 100mg','Antibiotic (Tetracycline)',19.99,45,true,'Tetracycline. C₂₂H₂₄N₂O₈·HCl. 100mg twice daily. Take with full glass of water.'),
  ('m11','Metronidazole 400mg','Antibiotic / Antiprotozoal',8.99,110,true,'Nitroimidazole. C₆H₉N₃O₃. Anaerobic infections, H. pylori. 400mg 3× daily.'),
  ('m12','Cefixime 200mg','Antibiotic (Cephalosporin)',24.99,0,false,'3rd-gen cephalosporin. C₁₆H₁₅N₅O₇S₂. 200mg twice daily or 400mg once daily.'),
  ('m13','Clindamycin 300mg','Antibiotic (Lincosamide)',28.99,35,true,'Lincosamide. C₁₈H₃₃ClN₂O₅S. Skin/soft tissue infections. 300mg every 6–8 hrs.'),
  ('m14','Omeprazole 20mg','Gastrointestinal (PPI)',13.99,130,true,'Proton pump inhibitor. C₁₇H₁₉N₃O₃S. GERD, ulcers. 20mg once daily before breakfast.'),
  ('m15','Pantoprazole 40mg','Gastrointestinal (PPI)',16.49,95,true,'PPI. C₁₆H₁₅F₂N₃O₄S. Acid reflux, Zollinger-Ellison. 40mg once daily before meal.'),
  ('m16','Ranitidine 150mg','Gastrointestinal (H2 Blocker)',7.99,0,false,'H2 receptor blocker. C₁₃H₂₂N₄O₃S. 150mg twice daily for peptic ulcers.'),
  ('m17','Domperidone 10mg','Gastrointestinal (Prokinetic)',6.49,160,true,'Antiemetic/prokinetic. C₂₂H₂₄ClN₅O₂. Nausea, vomiting. 10mg 3× daily before meals.'),
  ('m18','Ondansetron 4mg','Antiemetic',19.99,50,true,'5-HT3 antagonist. C₁₈H₁₉N₃O·HCl. Nausea/vomiting. 4–8mg 3× daily.'),
  ('m19','Loperamide 2mg','Antidiarrheal',5.49,180,true,'Opioid agonist (GI). C₂₉H₃₃ClN₂O₂. Acute diarrhea. 2mg after each loose stool. Max 16mg/day.'),
  ('m20','Amlodipine Besylate 5mg','Cardiovascular (CCB)',12.99,140,true,'Calcium channel blocker. Hypertension, angina. 5–10mg once daily.'),
  ('m21','Atorvastatin 10mg','Cardiovascular (Statin)',18.99,120,true,'HMG-CoA reductase inhibitor. C₃₃H₃₅FN₂O₅. Cholesterol. 10–80mg once daily at night.'),
  ('m22','Metoprolol Succinate 25mg','Cardiovascular (Beta-Blocker)',14.49,75,true,'Beta-1 selective blocker. Hypertension, heart failure. 25–200mg/day.'),
  ('m23','Losartan Potassium 50mg','Cardiovascular (ARB)',21.99,85,true,'Angiotensin II receptor blocker. C₂₂H₂₂ClKN₆O. Hypertension. 50mg once daily.'),
  ('m24','Furosemide 40mg','Diuretic (Loop)',8.49,0,false,'Loop diuretic. C₁₂H₁₁ClN₂O₅S. Edema, heart failure. 40mg once daily in morning.'),
  ('m25','Clopidogrel 75mg','Antiplatelet',29.99,65,true,'P2Y12 inhibitor. C₁₆H₁₆ClNO₂S. Post-MI, stroke prevention. 75mg once daily.'),
  ('m26','Metformin HCl 500mg','Antidiabetic (Biguanide)',9.49,200,true,'Insulin sensitizer. C₄H₁₁N₅·HCl. Type 2 DM. 500mg 2–3× daily with meals.'),
  ('m27','Glibenclamide (Glyburide) 5mg','Antidiabetic (Sulfonylurea)',7.99,110,true,'Sulfonylurea. C₂₃H₂₈ClN₃O₅S. Type 2 DM. 5mg once daily before breakfast.'),
  ('m28','Sitagliptin 100mg','Antidiabetic (DPP-4 Inhibitor)',45.99,40,true,'DPP-4 inhibitor. Type 2 DM. 100mg once daily with or without food.'),
  ('m29','Insulin Glargine 100 IU/mL','Antidiabetic (Insulin)',89.99,25,true,'Long-acting insulin analog. Dose individualized. SC injection once daily at same time.'),
  ('m30','Salbutamol (Albuterol) 100mcg Inhaler','Respiratory (SABA)',24.99,60,true,'Short-acting β2 agonist. C₁₃H₂₁NO₃. Asthma relief. 100–200mcg per puff, 2–4× daily.'),
  ('m31','Budesonide 200mcg Inhaler','Respiratory (ICS)',39.99,45,true,'Inhaled corticosteroid. C₂₅H₃₄O₆. Asthma control. 200–400mcg twice daily.'),
  ('m32','Montelukast Sodium 10mg','Respiratory (Leukotriene Antagonist)',22.49,80,true,'Leukotriene receptor antagonist. Asthma, allergic rhinitis. 10mg at night.'),
  ('m33','Theophylline 200mg','Respiratory (Bronchodilator)',11.99,0,false,'Methylxanthine. C₇H₈N₄O₂. Chronic asthma/COPD. 200–400mg twice daily (extended release).'),
  ('m34','Dextromethorphan 15mg + Guaifenesin 100mg','Cough / Expectorant',8.99,150,true,'Antitussive + expectorant. Dry/productive cough. 1–2 tablets every 4–6 hrs.'),
  ('m35','Cetirizine HCl 10mg','Antihistamine (2nd Gen)',6.99,200,true,'H1 antihistamine. C₂₁H₂₅ClN₂O₃·2HCl. Allergic rhinitis, urticaria. 10mg once daily.'),
  ('m36','Loratadine 10mg','Antihistamine (2nd Gen)',6.49,190,true,'Non-sedating H1 blocker. C₂₂H₂₃ClN₂O₂. Seasonal allergies. 10mg once daily.'),
  ('m37','Fexofenadine HCl 120mg','Antihistamine (2nd Gen)',12.99,100,true,'H1 antagonist. C₃₂H₃₉NO₄. Allergic rhinitis, hives. 120mg once daily.'),
  ('m38','Chlorpheniramine Maleate 4mg','Antihistamine (1st Gen)',3.99,170,true,'H1 blocker (sedating). C₁₆H₁₉ClN₂. Allergies, cold. 4mg 3–4× daily. Causes drowsiness.'),
  ('m39','Vitamin D3 (Cholecalciferol) 1000 IU','Vitamins & Supplements',8.99,250,true,'Fat-soluble vitamin. C₂₇H₄₄O. Bone health, immunity. 1000–2000 IU once daily with fatty meal.'),
  ('m40','Vitamin B12 (Cyanocobalamin) 500mcg','Vitamins & Supplements',7.49,200,true,'Water-soluble vitamin. C₆₃H₈₈CoN₁₄O₁₄P. Nerve health, anemia. 500mcg once daily.'),
  ('m41','Folic Acid (Vitamin B9) 5mg','Vitamins & Supplements',4.99,300,true,'B-vitamin. C₁₉H₁₉N₇O₆. Pregnancy, megaloblastic anemia. 5mg once daily.'),
  ('m42','Ferrous Sulfate 200mg (Iron 65mg)','Vitamins & Supplements',5.99,180,true,'Iron supplement. FeSO₄. Iron-deficiency anemia. 200mg 2–3× daily on empty stomach.'),
  ('m43','Calcium Carbonate 500mg + Vitamin D3 250 IU','Vitamins & Supplements',9.99,160,true,'Calcium + D3 combination. CaCO₃. Bone health, osteoporosis prevention. 1–2 tablets 3× daily.'),
  ('m44','Zinc Sulfate 220mg','Vitamins & Supplements',6.99,120,true,'Trace mineral. ZnSO₄·7H₂O. Immunity, wound healing. 220mg once daily with food.'),
  ('m45','Omega-3 Fish Oil 1000mg','Vitamins & Supplements',11.99,140,true,'EPA + DHA fatty acids. Cardiovascular, anti-inflammatory. 1–2 capsules daily with food.'),
  ('m46','Levothyroxine Sodium 50mcg','Thyroid',10.99,100,true,'Synthetic T4. C₁₅H₁₀I₄NNaO₄. Hypothyroidism. 50–200mcg once daily on empty stomach.'),
  ('m47','Carbimazole 5mg','Thyroid (Antithyroid)',12.49,0,false,'Antithyroid agent. C₇H₁₀N₂OS. Hyperthyroidism. 5–60mg/day in divided doses.'),
  ('m48','Sertraline HCl 50mg','Antidepressant (SSRI)',27.99,55,true,'SSRI. C₁₇H₁₇Cl₂N·HCl. Depression, anxiety, OCD. 50–200mg once daily. Rx required.'),
  ('m49','Escitalopram Oxalate 10mg','Antidepressant (SSRI)',31.99,50,true,'SSRI. C₂₀H₂₁FN₂O·C₂H₂O₄. Depression, GAD. 10–20mg once daily. Rx required.'),
  ('m50','Alprazolam 0.25mg','Anxiolytic (Benzodiazepine)',9.99,0,false,'BZD. C₁₇H₁₃ClN₄. Anxiety disorders. 0.25–0.5mg 3× daily. Rx mandatory. Habit-forming.'),
  ('m51','Clonazepam 0.5mg','Anxiolytic / Anticonvulsant',11.49,0,false,'BZD. C₁₅H₁₀ClN₃O₃. Epilepsy, panic disorder. 0.5mg twice daily. Rx required.'),
  ('m52','Gabapentin 300mg','Anticonvulsant / Neuropathic Pain',23.99,60,true,'Anticonvulsant. C₉H₁₇NO₂. Epilepsy, neuropathic pain. 300mg 3× daily. Rx required.'),
  ('m53','Fluconazole 150mg','Antifungal',16.99,70,true,'Triazole antifungal. C₁₃H₁₂F₂N₆O. Candidal infections. Single 150mg dose for vaginal candidiasis.'),
  ('m54','Clotrimazole 1% Cream 20g','Antifungal (Topical)',7.99,130,true,'Imidazole antifungal. C₂₂H₁₇ClN₂. Skin/nail fungal infections. Apply 2–3× daily for 2–4 weeks.'),
  ('m55','Acyclovir 200mg','Antiviral',13.49,45,true,'Nucleoside analog. C₈H₁₁N₅O₃. Herpes simplex, Herpes zoster. 200mg 5× daily for 5–10 days.'),
  ('m56','Hydrocortisone 1% Cream 15g','Topical Corticosteroid',8.49,100,true,'Topical corticosteroid. C₂₁H₃₀O₅. Eczema, dermatitis, rashes. Apply thin layer 2–4× daily.'),
  ('m57','Betamethasone 0.05% Cream 15g','Topical Corticosteroid (Potent)',10.99,0,false,'Potent corticosteroid. C₂₂H₂₉FO₅. Psoriasis, severe eczema. Apply sparingly once/twice daily.'),
  ('m58','Mupirocin 2% Ointment 5g','Topical Antibiotic',12.99,80,true,'Topical antibiotic. C₂₆H₄₄O₉. Impetigo, skin infections (MRSA). Apply 3× daily for 5–10 days.'),
  ('m59','Tamsulosin HCl 0.4mg','Urology (Alpha-Blocker)',19.99,55,true,'Alpha-1 blocker. C₂₀H₂₈N₂O₅S·HCl. BPH. 0.4mg once daily 30 min after same meal each day.'),
  ('m60','Oxybutynin 5mg','Urology (Anticholinergic)',14.49,40,true,'Anticholinergic. C₂₂H₃₁NO₃·HCl. Overactive bladder. 5mg 2–3× daily.'),
  ('m61','Ciprofloxacin Eye Drops 0.3% 5mL','Ophthalmic Antibiotic',9.99,60,true,'Fluoroquinolone. C₁₇H₁₈FN₃O₃. Bacterial conjunctivitis. 1–2 drops every 2–4 hrs for 7 days.'),
  ('m62','Timolol Maleate Eye Drops 0.5% 5mL','Ophthalmic (Glaucoma)',18.99,0,false,'Beta-blocker eye drops. C₁₃H₂₄N₄O₃S. Glaucoma, ocular hypertension. 1 drop twice daily.')
ON CONFLICT (id) DO NOTHING;
