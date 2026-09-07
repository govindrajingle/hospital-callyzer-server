const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
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
