// const { pool } = require("./database");
//
// const initializeDatabase = async () => {
//   const client = await pool.connect();
//
//   try {
//     await client.query("BEGIN");
//
//     await client.query(`
//             CREATE TABLE IF NOT EXISTS hospital_master (
//                 id BIGSERIAL PRIMARY KEY,
//                 hospital_name VARCHAR(200) NOT NULL,
//                 hospital_code VARCHAR(50) UNIQUE NOT NULL,
//                 address TEXT,
//                 city VARCHAR(100),
//                 state VARCHAR(100),
//                 is_active BOOLEAN NOT NULL DEFAULT TRUE,
//                 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
//             );
//         `);
//
//     await client.query(`
//             CREATE TABLE IF NOT EXISTS role_master (
//                 id BIGSERIAL PRIMARY KEY,
//                 role_name VARCHAR(100) NOT NULL UNIQUE,
//                 role_code VARCHAR(50) NOT NULL UNIQUE,
//                 parent_role_id BIGINT NULL,
//                 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//
//                 CONSTRAINT fk_role_parent
//                     FOREIGN KEY (parent_role_id)
//                     REFERENCES role_master(id)
//             );
//         `);
//
//     await client.query(`
//             CREATE TABLE IF NOT EXISTS users (
//                 id BIGSERIAL PRIMARY KEY,
//                 hospital_id BIGINT NOT NULL,
//                 role_id BIGINT NOT NULL,
//                 username VARCHAR(100) NOT NULL,
//                 full_name VARCHAR(200) NOT NULL,
//                 email VARCHAR(200),
//                 is_active BOOLEAN NOT NULL DEFAULT TRUE,
//                 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//
//                 CONSTRAINT fk_user_hospital
//                     FOREIGN KEY (hospital_id)
//                     REFERENCES hospital_master(id)
//                     ON DELETE CASCADE,
//
//                 CONSTRAINT fk_user_role
//                     FOREIGN KEY (role_id)
//                     REFERENCES role_master(id),
//
//                 CONSTRAINT uq_user_hospital_username
//                     UNIQUE (hospital_id, username)
//             );
//         `);
//
//     await client.query(`
//             CREATE INDEX IF NOT EXISTS idx_users_hospital_id
//             ON users(hospital_id);
//         `);
//
//     await client.query(`
//             CREATE INDEX IF NOT EXISTS idx_users_role_id
//             ON users(role_id);
//         `);
//
//     await client.query(`
//             CREATE TABLE IF NOT EXISTS user_relationship (
//                 id BIGSERIAL PRIMARY KEY,
//                 hospital_id BIGINT NOT NULL,
//                 senior_user_id BIGINT NOT NULL,
//                 junior_user_id BIGINT NOT NULL,
//                 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//
//                 CONSTRAINT fk_relationship_hospital
//                     FOREIGN KEY (hospital_id)
//                     REFERENCES hospital_master(id)
//                     ON DELETE CASCADE,
//
//                 CONSTRAINT fk_relationship_senior
//                     FOREIGN KEY (senior_user_id)
//                     REFERENCES users(id)
//                     ON DELETE CASCADE,
//
//                 CONSTRAINT fk_relationship_junior
//                     FOREIGN KEY (junior_user_id)
//                     REFERENCES users(id)
//                     ON DELETE CASCADE,
//
//                 CONSTRAINT uq_user_relationship
//                     UNIQUE (senior_user_id, junior_user_id),
//
//                 CONSTRAINT chk_no_self_relationship
//                     CHECK (senior_user_id <> junior_user_id)
//             );
//         `);
//
//     await client.query(`
//             CREATE INDEX IF NOT EXISTS idx_user_relationship_senior
//             ON user_relationship(senior_user_id);
//         `);
//
//     await client.query(`
//             CREATE INDEX IF NOT EXISTS idx_user_relationship_junior
//             ON user_relationship(junior_user_id);
//         `);
//
//     await client.query("COMMIT");
//
//     console.log("database tables initialized successfully");
//   } catch (error) {
//     await client.query("ROLLBACK");
//
//     console.error("database initialization failed:", error.message);
//
//     throw error;
//   } finally {
//     client.release();
//   }
// };
//
// module.exports = {
//   initializeDatabase,
// };
