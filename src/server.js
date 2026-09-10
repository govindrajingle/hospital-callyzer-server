const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const { testDatabaseConnection } = require("./config/database");
// const { initializeDatabase } = require("./config/database-init");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testDatabaseConnection();
    // await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("application startup failed");
    process.exit(1);
  }
};

startServer();
