import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stethoscope, Printer } from "lucide-react";
import type { Doctor, Patient } from "@/hooks/useClinicData";

interface RecipeGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors: Doctor[];
  patients: Patient[];
}

const CLINIC_INFO = {
  name: "Clínica Odontológica Salud Oriente",
  rif: "J-00000000-0",
  address: "C.C Novocentro piso 1, local 1-02, Puerto La Cruz 6023, Anzoátegui",
  phone: "0422-7180013",
};

const RecipeGenerator = ({ open, onOpenChange, doctors, patients }: RecipeGeneratorProps) => {
  const [form, setForm] = useState({
    doctorId: "",
    patientId: "",
    patientName: "",
    patientCedula: "",
    content: "",
    diagnosis: "",
  });

  const selectedDoctor = doctors.find(d => d.id === form.doctorId);
  const selectedPatient = patients.find(p => p.id === form.patientId);

  const update = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setForm(prev => ({ ...prev, patientId, patientName: patient.name, patientCedula: patient.cedula }));
    }
  };

  const today = new Date().toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" });

  const handlePrint = () => {
    if (!selectedDoctor) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Recipe Médico</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c4973b; padding-bottom: 20px; margin-bottom: 24px; }
        .clinic-name { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: bold; }
        .clinic-info { font-size: 11px; color: #666; margin-top: 4px; line-height: 1.6; }
        .recipe-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #c4973b; text-align: center; margin-bottom: 24px; }
        .doctor-info { background: #f5f5f0; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
        .doctor-name { font-size: 16px; font-weight: bold; }
        .doctor-details { font-size: 12px; color: #666; margin-top: 4px; }
        .patient-info { margin-bottom: 20px; font-size: 13px; }
        .patient-info span { color: #888; }
        .content-area { border: 1px solid #eee; border-radius: 8px; padding: 24px; min-height: 300px; font-size: 14px; line-height: 1.8; white-space: pre-wrap; margin-bottom: 30px; }
        .diagnosis { margin-bottom: 20px; font-size: 13px; }
        .diagnosis-label { color: #c4973b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .signature { margin-top: 80px; text-align: center; }
        .signature-line { border-top: 1px solid #1a1a1a; width: 250px; margin: 0 auto; padding-top: 8px; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
        .date { text-align: right; font-size: 13px; color: #666; margin-bottom: 16px; }
        @media print { body { padding: 20px; } }
      </style></head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">🦷 ${CLINIC_INFO.name}</div>
            <div class="clinic-info">
              RIF: ${CLINIC_INFO.rif}<br>
              ${CLINIC_INFO.address}<br>
              Tel: ${CLINIC_INFO.phone}
            </div>
          </div>
        </div>

        <div class="recipe-title">RECIPE MÉDICO</div>

        <div class="date">Puerto La Cruz, ${today}</div>

        <div class="doctor-info">
          <div class="doctor-name">Dr(a). ${selectedDoctor.name}</div>
          <div class="doctor-details">${selectedDoctor.specialty} • Email: ${selectedDoctor.email}</div>
        </div>

        <div class="patient-info">
          <p><span>Paciente:</span> <strong>${form.patientName || "—"}</strong></p>
          <p><span>Cédula:</span> ${form.patientCedula || "—"}</p>
        </div>

        ${form.diagnosis ? `<div class="diagnosis"><div class="diagnosis-label">Diagnóstico</div><p>${form.diagnosis}</p></div>` : ""}

        <div class="content-area">${form.content || ""}</div>

        <div class="signature">
          <div class="signature-line">
            Dr(a). ${selectedDoctor.name}<br>
            <span style="font-size: 11px; color: #888;">${selectedDoctor.specialty}</span>
          </div>
        </div>

        <div class="footer">
          ${CLINIC_INFO.name} • ${CLINIC_INFO.address} • Tel: ${CLINIC_INFO.phone}
        </div>

        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-gold" /> Recipe Médico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Doctor *</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-gold focus:outline-none" value={form.doctorId} onChange={(e) => update("doctorId", e.target.value)}>
              <option value="">Seleccionar doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Paciente</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-gold focus:outline-none" value={form.patientId} onChange={(e) => handlePatientSelect(e.target.value)}>
              <option value="">Seleccionar paciente o escribir</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — C.I. {p.cedula}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Nombre paciente</label>
              <input type="text" className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-gold focus:outline-none" value={form.patientName} onChange={(e) => update("patientName", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Cédula</label>
              <input type="text" className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-gold focus:outline-none" value={form.patientCedula} onChange={(e) => update("patientCedula", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Diagnóstico</label>
            <input type="text" className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-gold focus:outline-none" value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)} placeholder="Diagnóstico del paciente" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Indicaciones / Prescripción *</label>
            <textarea className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-gold focus:outline-none resize-none" rows={6} value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="Escriba las indicaciones médicas, medicamentos, dosis, etc." />
          </div>

          <button onClick={handlePrint} disabled={!selectedDoctor || !form.content}
            className="w-full bg-gold text-gold-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <Printer className="w-4 h-4" /> Imprimir Recipe
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeGenerator;
