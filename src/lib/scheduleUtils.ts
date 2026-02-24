
export const getCaracasDate = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Caracas" }));
};

export const getCaracasNow = () => getCaracasDate();

export const getCaracasToday = () => {
  const c = getCaracasDate();
  return `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`;
};

export interface BlockedSlotData {
  date: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface TenantWithSlots {
  firstName: string;
  lastName: string;
  blockedSlots: BlockedSlotData[];
}

export const isSlotBlockedByTenant = (
  date: string,
  time: string,
  tenants: TenantWithSlots[]
): { blocked: boolean; tenantName?: string } => {
  const hour = parseInt(time.split(':')[0]);
  for (const tenant of tenants) {
    for (const slot of tenant.blockedSlots) {
      if (slot.date !== date) continue;
      if (slot.allDay) return { blocked: true, tenantName: `${tenant.firstName} ${tenant.lastName}` };
      if (slot.startTime && slot.endTime) {
        const start = parseInt(slot.startTime.split(':')[0]);
        const end = parseInt(slot.endTime.split(':')[0]);
        if (hour >= start && hour < end) {
          return { blocked: true, tenantName: `${tenant.firstName} ${tenant.lastName}` };
        }
      }
    }
  }
  return { blocked: false };
};

export interface AppointmentSlotData {
  id: string;
  date: string;
  time: string;
  status: string;
}

export const validateSlot = (
  date: string,
  time: string,
  appointments: AppointmentSlotData[],
  tenants: TenantWithSlots[],
  excludeId?: string
): boolean => {
  const tenantCheck = isSlotBlockedByTenant(date, time, tenants);
  if (tenantCheck.blocked) return false;

  const requested = new Date(`${date}T${time}`);
  const collision = appointments.some((app) => {
    if (excludeId && app.id === excludeId) return false;
    if (app.status === 'cancelada') return false;
    const existing = new Date(`${app.date}T${app.time}`);
    const diff = Math.abs(requested.getTime() - existing.getTime()) / (1000 * 60);
    return app.date === date && diff < 60;
  });
  return !collision;
};

export const validateSchedule = (date: string, time: string): { valid: boolean; reason?: string } => {
  const d = new Date(`${date}T${time}`);
  const day = d.getDay();
  const hours = parseInt(time.split(':')[0]);
  const minutes = parseInt(time.split(':')[1]);
  const timeInMinutes = hours * 60 + minutes;

  if (day === 0) return { valid: false, reason: 'No se aceptan citas los domingos' };
  if (day === 6) {
    if (timeInMinutes < 480 || timeInMinutes >= 840) {
      return { valid: false, reason: 'Sábados: 08:00 - 14:00' };
    }
  } else {
    if (timeInMinutes < 480 || timeInMinutes >= 1020) {
      return { valid: false, reason: 'Lun-Vie: 08:00 - 17:00' };
    }
  }
  return { valid: true };
};
