const doctorScheduleModel = require("../models/doctorschedule.model");

// The clinic-wide default when a doctor hasn't set their own hours yet:
// 9 AM-9 PM with a 2-hour lunch break starting at 1 PM (1 PM-3 PM). Both
// appointment.service.js (slot generation) and this file's own fallback
// use this exact constant, so there's one place that defines "default
// hours" for the whole system.
const DEFAULT_SCHEDULE = {
  startTime: "09:00",
  endTime: "21:00",
  breakStartTime: "13:00",
  breakEndTime: "15:00",
};

// Always returns a usable schedule — either the doctor's own saved one, or
// the clinic default — so callers (the slot picker, the booking form) never
// have to special-case "doctor hasn't configured anything yet".
const getEffectiveSchedule = async (hospitalId, doctorId) => {
  const saved = await doctorScheduleModel.getByDoctor(hospitalId, doctorId);
  if (!saved) return { ...DEFAULT_SCHEDULE, isCustom: false };

  return {
    startTime: saved.start_time.slice(0, 5),
    endTime: saved.end_time.slice(0, 5),
    breakStartTime: saved.break_start_time ? saved.break_start_time.slice(0, 5) : null,
    breakEndTime: saved.break_end_time ? saved.break_end_time.slice(0, 5) : null,
    isCustom: true,
  };
};

const saveSchedule = async (hospitalId, doctorId, schedule) => {
  const saved = await doctorScheduleModel.upsertForDoctor(hospitalId, doctorId, schedule);

  return {
    startTime: saved.start_time.slice(0, 5),
    endTime: saved.end_time.slice(0, 5),
    breakStartTime: saved.break_start_time ? saved.break_start_time.slice(0, 5) : null,
    breakEndTime: saved.break_end_time ? saved.break_end_time.slice(0, 5) : null,
    isCustom: true,
  };
};

module.exports = {
  DEFAULT_SCHEDULE,
  getEffectiveSchedule,
  saveSchedule,
};
