const { pool } = require("../config/database");
const appointmentModel = require("../models/appointment.model");
const appointmentTypeModel = require("../models/appointmenttype.model");

const DEFAULT_SLOT_MINUTES = 30;

// Clinic business hours used to generate the bookable slot grid for the
// "available slots" picker. Not sourced from any hospital-settings table
// (none exists yet) — this is a single fixed window for all hospitals.
// If a clinic needs per-hospital hours, this is the place to make it
// hospital-configurable later.
const BUSINESS_START_HOUR = 9; // 9:00 AM
const BUSINESS_END_HOUR = 18; // 6:00 PM (last bookable slot starts before this)

const withSlotEnd = (slotStart, slotEnd) => {
  if (slotEnd) return slotEnd;
  return new Date(new Date(slotStart).getTime() + DEFAULT_SLOT_MINUTES * 60000).toISOString();
};

// Builds the full business-hours slot grid for one calendar day (in the
// server's local time zone, matching how the booking form already builds
// slotStart from separate date/time inputs) and marks each slot as
// available/unavailable against the doctor's existing, non-cancelled
// appointments for that day — so the receptionist picks a real free slot
// instead of guessing a time and hitting a 409 conflict.
const getAvailableSlots = async (hospitalId, doctorId, dateStr, excludeAppointmentId) => {
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999`);

  const existing = await appointmentModel.getAppointmentsByDoctor(
    hospitalId, doctorId, { from: dayStart, to: dayEnd },
  );
  const blocking = existing.filter(
    (a) => a.status !== "cancelled" && String(a.id) !== String(excludeAppointmentId || ""),
  );

  const slots = [];
  const cursor = new Date(`${dateStr}T00:00:00`);
  cursor.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  const dayLimit = new Date(`${dateStr}T00:00:00`);
  dayLimit.setHours(BUSINESS_END_HOUR, 0, 0, 0);

  while (cursor < dayLimit) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(slotStart.getTime() + DEFAULT_SLOT_MINUTES * 60000);

    const isBooked = blocking.some((a) => {
      const bStart = new Date(a.slot_start);
      const bEnd = new Date(a.slot_end);
      return slotStart < bEnd && slotEnd > bStart;
    });

    slots.push({
      slotStart: slotStart.toISOString(),
      slotEnd: slotEnd.toISOString(),
      isAvailable: !isBooked,
    });

    cursor.setMinutes(cursor.getMinutes() + DEFAULT_SLOT_MINUTES);
  }

  return slots;
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

const createAppointment = async (appointmentData) => {
  const { hospitalId, doctorId, type, confirmNewType, createdBy } = appointmentData;
  const slotStart = appointmentData.slotStart;
  const slotEnd = withSlotEnd(appointmentData.slotStart, appointmentData.slotEnd);

  const typeResult = await resolveType(hospitalId, type, confirmNewType);
  if (!typeResult.success) {
    return typeResult;
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
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
};
