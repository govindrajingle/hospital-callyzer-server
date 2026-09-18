const express = require("express");
const cors = require("cors");

const hospitalRoutes = require("./routes/hospital.routes");
const userRoutes = require("./routes/user.routes");
const rolemasterRoutes = require("./routes/rolemaster.routes");
const userRelationshipRoutes = require("./routes/userrelationship.routes");
const authRoutes = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const appointmentRoutes = require("./routes/appointment.routes");

const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Without this, a React app running on a different origin/port (e.g.
// localhost:5173 during development) would have every request silently
// blocked by the browser before it even reaches these routes.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "hospital callyzer api is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/role-masters", rolemasterRoutes);
app.use("/api/users-relationship", userRelationshipRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(errorHandler);

module.exports = app;
