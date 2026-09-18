// Pinned to the clinic's real timezone (Sozo is based in India) BEFORE
// anything else runs. Without this, the process falls back to the host's
// OS timezone — UTC on most cloud hosts — and every wall-clock time this
// app works with (a doctor's "9:00 AM" consultation-hours setting, the
// appointment slot grid, "is this slot in the past") would be built and
// compared against the wrong clock, silently shifting all of them by the
// host/IST offset. This is a single fixed zone, not per-hospital
// configurable — fine for now since this is one clinic's own system.
process.env.TZ = process.env.TZ || "Asia/Kolkata";

const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const { testDatabaseConnection } = require("./config/database");
const { initializeDatabase } = require("./config/database-init");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testDatabaseConnection();
    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("application startup failed");
    process.exit(1);
  }
};

startServer();
