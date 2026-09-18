/* One-time seed: creates a hospital, and one user per role, for first login/testing.
   Run with: node src/scripts/seed.js
*/
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const initDatabase = require("../config/database-init");

async function seed() {
  await initDatabase();

  const hospitalRes = await pool.query(
    `INSERT INTO hospital_master (hospital_code, hospital_name, city, state)
     VALUES ('SOZO-MAIN', 'Sozo Wellness & Esthetics', 'Pune', 'Maharashtra')
     ON CONFLICT (hospital_code) DO UPDATE SET hospital_name = EXCLUDED.hospital_name
     RETURNING hospital_id`
  );
  const hospitalId = hospitalRes.rows[0].hospital_id;

  // Re-seed appointment types for this hospital (in case it was created after
  // database-init's own seed step, which only fires for the very first row).
  await pool.query(
    `INSERT INTO appointment_type_master (hospital_id, type_name, is_system_default)
     VALUES ($1,'Consultation',TRUE), ($1,'Surgery',TRUE), ($1,'Other',TRUE)
     ON CONFLICT (hospital_id, type_name) DO NOTHING`,
    [hospitalId]
  );

  const users = [
    { roleCode: "ADMIN", username: "admin", fullName: "Sozo Admin", password: "admin123" },
    { roleCode: "DOCTOR", username: "doctor1", fullName: "Dr. Rekha Sharma", password: "doctor123" },
    { roleCode: "RECEPTIONIST", username: "reception1", fullName: "Reception Desk", password: "reception123" },
  ];

  for (const u of users) {
    const roleRes = await pool.query(`SELECT role_id FROM role_master WHERE role_code = $1`, [u.roleCode]);
    const roleId = roleRes.rows[0].role_id;
    const passwordHash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (hospital_id, role_id, full_name, username, password_hash)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (username) DO NOTHING`,
      [hospitalId, roleId, u.fullName, u.username, passwordHash]
    );
    console.log(`Seeded user: ${u.username} / ${u.password} (${u.roleCode})`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
