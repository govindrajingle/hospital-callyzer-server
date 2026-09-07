const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
