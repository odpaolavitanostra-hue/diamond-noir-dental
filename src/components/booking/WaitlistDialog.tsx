import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAllAvailableSlots } from "@/lib/scheduleUtils";
import type { AppointmentSlotData, TenantWithSlots } from "@/lib/scheduleUtils";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    patientName: string;
    patientCedula: string;
    patientPhone: string;
    patientEmail: string;
    doctorId: string;
    date: string;
    treatment: string;
    notes: string;
  };
  appointments: AppointmentSlotData[];
  tenants: TenantWithSlots[];
  priceUSD: number;
  currentHour?: number;
  isToday: boolean;
  onSuccess: () => void;
}

const WaitlistDialog = ({
  open,
  onOpenChange,
  form,
  appointments,
  tenants,
  priceUSD,
  currentHour,
  isToday,
  onSuccess,
}: WaitlistDialogProps) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allSlots = form.date
    ? getAllAvailableSlots(form.date, appointments, tenants, currentHour, isToday)
    : [];

  const handleSubmit = async () => {
    if (!selectedTime) {
      toast.error("Selecciona un horario");
      return;
    }
    if (!form.patientName || !form.patientCedula || !form.patientPhone || !form.patientEmail) {
      toast.error("Completa tus datos personales primero");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        patient_name: form.patientName.trim(),
        patient_phone: form.patientPhone.trim(),
        patient_cedula: form.patientCedula.trim(),
        patient_email: form.patientEmail.trim(),
        doctor_id: form.doctorId || null,
        date: form.date,
        time: selectedTime,
        treatment: form.treatment,
        price_usd: priceUSD,
        status: "pendiente_confirmacion",
        notes: `[LISTA DE ESPERA] ${form.notes || "Paciente solicitó horario fuera de los bloques sugeridos."}`,
      });

      if (error) throw error;

      toast.success("¡Solicitud enviada! Tu cita queda pendiente de confirmación por el consultorio.");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Error al enviar la solicitud. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" /> Lista de Espera
          </DialogTitle>
          <DialogDescription>
            Selecciona el horario que prefieras. Tu cita quedará <strong>pendiente de confirmación</strong> por nuestro equipo.
          </DialogDescription>
        </DialogHeader>

        {allSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay horarios disponibles para esta fecha.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {allSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-3 rounded-lg text-sm font-medium transition-all border ${
                    selectedTime === slot
                      ? "bg-gold text-gold-foreground border-gold"
                      : "bg-muted border-border hover:border-gold/50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !selectedTime}
              className="w-full bg-gold text-gold-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Enviando..." : "Solicitar este horario"}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              El consultorio revisará tu solicitud y te confirmará por teléfono o email.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;
