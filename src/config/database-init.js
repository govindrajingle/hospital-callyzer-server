const { pool } = require("./database");

const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
            CREATE TABLE IF NOT EXISTS hospital_master (
                id BIGSERIAL PRIMARY KEY,
                hospital_name VARCHAR(200) NOT NULL,
                hospital_code VARCHAR(50) UNIQUE NOT NULL,
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS role_master (
                id BIGSERIAL PRIMARY KEY,
                role_name VARCHAR(100) NOT NULL UNIQUE,
                role_code VARCHAR(50) NOT NULL UNIQUE,
                parent_role_id BIGINT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_role_parent
                    FOREIGN KEY (parent_role_id)
                    REFERENCES role_master(id)
            );
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                hospital_id BIGINT NOT NULL,
                role_id BIGINT NOT NULL,
                username VARCHAR(100) NOT NULL,
                full_name VARCHAR(200) NOT NULL,
                email VARCHAR(200),
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_user_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_user_role
                    FOREIGN KEY (role_id)
                    REFERENCES role_master(id),

                CONSTRAINT uq_user_hospital_username
                    UNIQUE (hospital_id, username)
            );
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_hospital_id
            ON users(hospital_id);
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_role_id
            ON users(role_id);
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS user_relationship (
                id BIGSERIAL PRIMARY KEY,
                hospital_id BIGINT NOT NULL,
                senior_user_id BIGINT NOT NULL,
                junior_user_id BIGINT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_relationship_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_relationship_senior
                    FOREIGN KEY (senior_user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_relationship_junior
                    FOREIGN KEY (junior_user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                CONSTRAINT uq_user_relationship
                    UNIQUE (senior_user_id, junior_user_id),

                CONSTRAINT chk_no_self_relationship
                    CHECK (senior_user_id <> junior_user_id)
            );
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_relationship_senior
            ON user_relationship(senior_user_id);
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_relationship_junior
            ON user_relationship(junior_user_id);
        `);

    // Added for authentication — the users table did not have any password
    // field at all. ADD COLUMN IF NOT EXISTS is safe to re-run and will not
    // affect the columns that already exist on Railway.
    await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS password_hash TEXT;
        `);

    // One row per hospital, used to atomically generate the next MRN number
    // for that hospital (see patient.model.js generateNextMrn). Using a
    // dedicated sequence table with an UPSERT avoids the race condition you
    // would get from doing "SELECT MAX(...) + 1" under concurrent requests.
    await client.query(`
            CREATE TABLE IF NOT EXISTS patient_mrn_sequence (
                hospital_id BIGINT PRIMARY KEY,
                last_number BIGINT NOT NULL DEFAULT 0,

                CONSTRAINT fk_mrn_sequence_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE
            );
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id BIGSERIAL PRIMARY KEY,
                hospital_id BIGINT NOT NULL,
                mrn VARCHAR(50) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100),
                date_of_birth DATE,
                gender VARCHAR(20),
                mobile VARCHAR(20) NOT NULL,
                email VARCHAR(200),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                blood_group VARCHAR(10),
                emergency_contact_name VARCHAR(200),
                emergency_contact_number VARCHAR(20),
                government_id_type VARCHAR(50),
                government_id_number VARCHAR(100),
                photo_url TEXT,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_by BIGINT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_patient_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_patient_created_by
                    FOREIGN KEY (created_by)
                    REFERENCES users(id)
                    ON DELETE SET NULL,

                -- MRN only needs to be unique WITHIN a hospital, not
                -- globally, since each hospital generates its own sequence.
                CONSTRAINT uq_patient_hospital_mrn
                    UNIQUE (hospital_id, mrn)
            );
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_patients_hospital_id
            ON patients(hospital_id);
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_patients_mobile
            ON patients(hospital_id, mobile);
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_patients_name
            ON patients(hospital_id, first_name, last_name);
        `);

    // Added to match Sozo's actual paper registration form (street,
    // locality, landmark, PIN/country, separate residence/office phone
    // lines, occupation, marital status, treatment plan, referral source,
    // and consent). ADD COLUMN IF NOT EXISTS keeps this safe to re-run
    // against a database that already has rows in it.
    await client.query(`
            ALTER TABLE patients
            ADD COLUMN IF NOT EXISTS street VARCHAR(255),
            ADD COLUMN IF NOT EXISTS locality VARCHAR(150),
            ADD COLUMN IF NOT EXISTS landmark VARCHAR(150),
            ADD COLUMN IF NOT EXISTS pin_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS telephone_residence VARCHAR(20),
            ADD COLUMN IF NOT EXISTS telephone_office VARCHAR(20),
            ADD COLUMN IF NOT EXISTS fax_number VARCHAR(20),
            ADD COLUMN IF NOT EXISTS occupation VARCHAR(150),
            ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20),
            ADD COLUMN IF NOT EXISTS plan_type VARCHAR(150),
            ADD COLUMN IF NOT EXISTS plan_expires_date DATE,
            ADD COLUMN IF NOT EXISTS ailment TEXT,
            ADD COLUMN IF NOT EXISTS referral_source VARCHAR(50),
            ADD COLUMN IF NOT EXISTS referral_person_name VARCHAR(200),
            ADD COLUMN IF NOT EXISTS consent_terms BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT FALSE;
        `);

    // Middle name, preferred contact timing (AM/PM, from the paper form's
    // "please indicate preferred timings" note), and the referring
    // patient's own MRN/PRN (so a referral can later be linked to an
    // actual record, not just a typed name).
    await client.query(`
            ALTER TABLE patients
            ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS preferred_contact_time VARCHAR(10),
            ADD COLUMN IF NOT EXISTS referral_patient_mrn VARCHAR(50);
        `);

    // Appointment module — backs the receptionist "Create Appointment"
    // screen, the doctor's day/week/month schedule, and the patient
    // profile's Appointments/Billings tabs. Created only by Receptionist,
    // edited only by Admin (enforced in rbacMiddleware, not here).
    await client.query(`
            CREATE TABLE IF NOT EXISTS appointment_type_master (
                id BIGSERIAL PRIMARY KEY,
                hospital_id BIGINT NOT NULL,
                type_name VARCHAR(100) NOT NULL,
                is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_appointment_type_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE,

                CONSTRAINT uq_appointment_type_hospital_name
                    UNIQUE (hospital_id, type_name)
            );
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id BIGSERIAL PRIMARY KEY,
                hospital_id BIGINT NOT NULL,
                patient_id BIGINT NOT NULL,
                doctor_id BIGINT NOT NULL,
                receiver_id BIGINT,
                receiver_name VARCHAR(200),
                slot_start TIMESTAMPTZ NOT NULL,
                slot_end TIMESTAMPTZ NOT NULL,
                type VARCHAR(100) NOT NULL,
                fees NUMERIC(10, 2) NOT NULL DEFAULT 0,
                payment_mode VARCHAR(20) NOT NULL DEFAULT 'cash',
                status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
                created_by BIGINT NOT NULL,
                updated_by BIGINT,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_appointment_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_appointment_patient
                    FOREIGN KEY (patient_id)
                    REFERENCES patients(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_appointment_doctor
                    FOREIGN KEY (doctor_id)
                    REFERENCES users(id),

                CONSTRAINT fk_appointment_receiver
                    FOREIGN KEY (receiver_id)
                    REFERENCES users(id),

                CONSTRAINT fk_appointment_created_by
                    FOREIGN KEY (created_by)
                    REFERENCES users(id),

                CONSTRAINT fk_appointment_updated_by
                    FOREIGN KEY (updated_by)
                    REFERENCES users(id)
            );
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_appointments_doctor_slot
            ON appointments(doctor_id, slot_start);
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_appointments_patient
            ON appointments(patient_id);
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_appointments_hospital
            ON appointments(hospital_id);
        `);

    // Who created/edited each appointment and when — separate from
    // created_at/updated_at so a full history survives even if the row
    // itself is edited again later.
    await client.query(`
            CREATE TABLE IF NOT EXISTS appointment_audit_log (
                id BIGSERIAL PRIMARY KEY,
                appointment_id BIGINT NOT NULL,
                action VARCHAR(20) NOT NULL,
                performed_by BIGINT NOT NULL,
                performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                details JSONB,

                CONSTRAINT fk_appointment_audit_appointment
                    FOREIGN KEY (appointment_id)
                    REFERENCES appointments(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_appointment_audit_performed_by
                    FOREIGN KEY (performed_by)
                    REFERENCES users(id)
            );
        `);

    // Per-doctor consultation hours master — a doctor sets their own working
    // window and lunch break here; the appointment slot picker generates its
    // grid from this instead of one fixed clinic-wide window. One row per
    // doctor. A doctor with no row here just gets the hardcoded default
    // (9 AM-9 PM, 1-3 PM break) applied in appointment.service.js — this
    // table only needs a row once a doctor customizes their own hours.
    await client.query(`
            CREATE TABLE IF NOT EXISTS doctor_schedule (
                id BIGSERIAL PRIMARY KEY,
                hospital_id BIGINT NOT NULL,
                doctor_id BIGINT NOT NULL,
                start_time TIME NOT NULL DEFAULT '09:00',
                end_time TIME NOT NULL DEFAULT '21:00',
                -- Either both break columns are set or both are NULL (no
                -- break) — enforced in the validation layer, not here.
                break_start_time TIME,
                break_end_time TIME,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_doctor_schedule_hospital
                    FOREIGN KEY (hospital_id)
                    REFERENCES hospital_master(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_doctor_schedule_doctor
                    FOREIGN KEY (doctor_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                CONSTRAINT uq_doctor_schedule_doctor
                    UNIQUE (doctor_id)
            );
        `);

    // Backfills the three baseline appointment categories ("consultation,
    // surgery, other" per the handwritten schema) for any hospital that
    // existed before the appointment module was added — new hospitals get
    // these seeded directly in hospital.service.createHospital instead.
    // ON CONFLICT DO NOTHING makes this safe to re-run on every startup.
    await client.query(`
            INSERT INTO appointment_type_master (hospital_id, type_name, is_system_default)
            SELECT h.id, t.type_name, TRUE
            FROM hospital_master h
            CROSS JOIN (VALUES ('Consultation'), ('Surgery'), ('Other')) AS t(type_name)
            ON CONFLICT (hospital_id, type_name) DO NOTHING;
        `);

    await client.query("COMMIT");

    console.log("database tables initialized successfully");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("database initialization failed:", error.message);

    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  initializeDatabase,
};
