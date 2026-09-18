const { pool } = require("../config/database");
const appointmentModel = require("../models/appointment.model");
const appointmentTypeModel = require("../models/appointmenttype.model");
const doctorScheduleService = require("./doctorschedule.service");

const DEFAULT_SLOT_MINUTES = 30;

const withSlotEnd = (slotStart, slotEnd) => {
  if (slotEnd) return slotEnd;
  return new Date(new Date(slotStart).getTime() + DEFAULT_SLOT_MINUTES * 60000).toISOString();
};

// hh:mm -> a Date on dateStr's calendar day, in the server's local time
// zone (matches how the booking form already builds slotStart from
// separate date/time inputs).
const timeOnDate = (dateStr, hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
};

// True if [aStart, aEnd) is fully outside the doctor's working hours, or
// overlaps their lunch break at all — used both to build the slot grid and
// to reject a direct create/update request that tries to land outside a
// doctor's own consultation hours (the slot picker is a UX convenience,
// not the only guard).
const violatesSchedule = (dateStr, slotStart, slotEnd, schedule) => {
  const workStart = timeOnDate(dateStr, schedule.startTime);
  const workEnd = timeOnDate(dateStr, schedule.endTime);
  if (slotStart < workStart || slotEnd > workEnd) return true;

  if (schedule.breakStartTime && schedule.breakEndTime) {
    const breakStart = timeOnDate(dateStr, schedule.breakStartTime);
    const breakEnd = timeOnDate(dateStr, schedule.breakEndTime);
    if (slotStart < breakEnd && slotEnd > breakStart) return true;
  }

  return false;
};

// Builds this doctor's own consultation-hours slot grid for one calendar
// day and marks each slot available/booked/past/on-break against their
// existing, non-cancelled appointments for that day — so the receptionist
// picks a real free slot instead of guessing a time and hitting a 409
// conflict or an "outside working hours" rejection.
const getAvailableSlots = async (hospitalId, doctorId, dateStr, excludeAppointmentId) => {
  const schedule = await doctorScheduleService.getEffectiveSchedule(hospitalId, doctorId);

  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999`);

  const existing = await appointmentModel.getAppointmentsByDoctor(
    hospitalId, doctorId, { from: dayStart, to: dayEnd },
  );
  const blocking = existing.filter(
    (a) => a.status !== "cancelled" && String(a.id) !== String(excludeAppointmentId || ""),
  );

  const slots = [];
  const cursor = timeOnDate(dateStr, schedule.startTime);
  const dayLimit = timeOnDate(dateStr, schedule.endTime);
  const breakStart = schedule.breakStartTime ? timeOnDate(dateStr, schedule.breakStartTime) : null;
  const breakEnd = schedule.breakEndTime ? timeOnDate(dateStr, schedule.breakEndTime) : null;
  const now = new Date();

  while (cursor < dayLimit) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(slotStart.getTime() + DEFAULT_SLOT_MINUTES * 60000);

    const isBooked = blocking.some((a) => {
      const bStart = new Date(a.slot_start);
      const bEnd = new Date(a.slot_end);
      return slotStart < bEnd && slotEnd > bStart;
    });
    const isBreak = Boolean(breakStart && breakEnd && slotStart < breakEnd && slotEnd > breakStart);
    // Booking is future-only (matches createAppointmentSchema's
    // slotStart.greater("now")) — a slot that's already elapsed is neither
    // "available" nor "booked", it's just not choosable any more.
    const isPast = slotStart <= now;

    slots.push({
      slotStart: slotStart.toISOString(),
      slotEnd: slotEnd.toISOString(),
      isAvailable: !isBooked && !isPast && !isBreak,
      isBooked,
      isPast,
      isBreak,
    });

    cursor.setMinutes(cursor.getMinutes() + DEFAULT_SLOT_MINUTES);
  }

  return { schedule, slots };
};

// The "type" field is a typeable + selectable dropdown (consultation /
// surgery / other / anything the clinic wants). If the typed value isn't
// already in appointment_type_master for this hospital, the caller must
// have confirmed adding it first (confirmNewType === true) — this is what
// stops a stray typo from silently becoming a permanent new category.
const resolveType = async (hospitalId, typeName, confirmNewType) => {
  const existing = await appointmentTypeModel.getTypeByName(hospitalId, typeName);
  if (existing) return { success: true, typeName: existing.type_name };

  if (!confirmNewType) {
    return { success: false, reason: "NEW_TYPE_CONFIRMATION_REQUIRED", typeName };
  }

  const created = await appointmentTypeModel.createType(hospitalId, typeName);
  return { success: true, typeName: created.type_name };
};

const getTypes = async (hospitalId) => {
  return await appointmentTypeModel.getTypesByHospital(hospitalId);
};

// Local (server time zone) YYYY-MM-DD for a Date/ISO value — matches how
// timeOnDate/violatesSchedule interpret a "day" for schedule purposes.
const dateStrOf = (value) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const createAppointment = async (appointmentData) => {
  const { hospitalId, doctorId, type, confirmNewType, createdBy } = appointmentData;
  const slotStart = appointmentData.slotStart;
  const slotEnd = withSlotEnd(appointmentData.slotStart, appointmentData.slotEnd);

  const typeResult = await resolveType(hospitalId, type, confirmNewType);
  if (!typeResult.success) {
    return typeResult;
  }

  // The slot picker is a UX convenience, not the only guard — reject a
  // direct booking request that lands outside the doctor's own working
  // hours or lunch break, the same as a booked-slot conflict would be.
  const schedule = await doctorScheduleService.getEffectiveSchedule(hospitalId, doctorId);
  if (violatesSchedule(dateStrOf(slotStart), new Date(slotStart), new Date(slotEnd), schedule)) {
    return { success: false, reason: "OUTSIDE_WORKING_HOURS", schedule };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Locks the table for the duration of the check-then-insert so two
    // concurrent bookings for the same doctor/slot can't both pass the
    // conflict check before either one commits.
    await client.query("LOCK TABLE appointments IN SHARE ROW EXCLUSIVE MODE");

    const conflicts = await appointmentModel.findConflict(
      { doctorId, slotStart, slotEnd },
      client,
    );
    if (conflicts.length > 0) {
      await client.query("ROLLBACK");
      return { success: false, reason: "SLOT_CONFLICT" };
    }

    const appointment = await appointmentModel.createAppointment(
      { ...appointmentData, slotStart, slotEnd, type: typeResult.typeName },
      client,
    );

    await appointmentModel.addAuditEntry(
      appointment.id,
      "created",
      createdBy,
      { patientId: appointmentData.patientId, doctorId, slotStart },
      client,
    );

    await client.query("COMMIT");
    return { success: true, appointment };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateAppointment = async (hospitalId, id, updates, updatedBy) => {
  const existing = await appointmentModel.getAppointmentById(hospitalId, id);
  if (!existing) return { success: false, reason: "NOT_FOUND" };

  const merged = {
    doctorId: updates.doctorId ?? existing.doctor_id,
    receiverId: updates.receiverId !== undefined ? updates.receiverId : existing.receiver_id,
    receiverName: updates.receiverName !== undefined ? updates.receiverName : existing.receiver_name,
    slotStart: updates.slotStart ?? existing.slot_start,
    slotEnd: updates.slotEnd ?? (updates.slotStart ? null : existing.slot_end),
    type: updates.type ?? existing.type,
    fees: updates.fees ?? existing.fees,
    paymentMode: updates.paymentMode ?? existing.payment_mode,
    status: updates.status ?? existing.status,
  };
  merged.slotEnd = withSlotEnd(merged.slotStart, merged.slotEnd);

  if (updates.type) {
    const typeResult = await resolveType(hospitalId, updates.type, updates.confirmNewType);
    if (!typeResult.success) return typeResult;
    merged.type = typeResult.typeName;
  }

  // Only re-check working hours/break when the slot or doctor is actually
  // changing — admin still needs to be able to save an unrelated edit (or
  // mark completed/cancelled/no-show) on an appointment whose original
  // time no longer fits the doctor's current hours.
  if (updates.slotStart || updates.doctorId) {
    const schedule = await doctorScheduleService.getEffectiveSchedule(hospitalId, merged.doctorId);
    if (violatesSchedule(dateStrOf(merged.slotStart), new Date(merged.slotStart), new Date(merged.slotEnd), schedule)) {
      return { success: false, reason: "OUTSIDE_WORKING_HOURS", schedule };
    }
  }

  const conflicts = await appointmentModel.findConflict({
    doctorId: merged.doctorId, slotStart: merged.slotStart, slotEnd: merged.slotEnd, excludeId: id,
  });
  if (conflicts.length > 0) {
    return { success: false, reason: "SLOT_CONFLICT" };
  }

  const appointment = await appointmentModel.updateAppointment(hospitalId, id, merged, updatedBy);
  await appointmentModel.addAuditEntry(id, "updated", updatedBy, merged);

  return { success: true, appointment };
};

module.exports = {
  getTypes,
  createAppointment,
  updateAppointment,
  getAvailableSlots,
  DEFAULT_SLOT_MINUTES,
};
