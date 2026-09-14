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
