const { Pool } = require("pg");

// Supports two ways of configuring the connection, so switching between
// Railway, Neon, or local Postgres never needs a code change — just a
// different .env file:
//
//   1. DATABASE_URL — a single connection string. This is how Neon's own
//      dashboard presents credentials (and Railway also offers this format
//      under its "Connect" tab as "Postgres Connection URL").
//   2. PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD — separate fields, kept
//      for backward compatibility with the original Railway setup.
//
// If DATABASE_URL is present, it takes priority.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      // disable this if connection is not working
      ssl: {
        rejectUnauthorized: false,
      },
    });

const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("postgresql connected successfully");
    client.release();
  } catch (error) {
    console.error("postgresql connection failed", error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testDatabaseConnection,
};
