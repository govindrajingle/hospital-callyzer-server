const express = require("express");

const hospitalRoutes = require("./routes/hospital.routes");
const userRoutes = require("./routes/user.routes");
const rolemasterRoutes = require("./routes/rolemaster.routes");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "Hospital Callyzer API is running",
  });
});

app.use("/api/hospitals", hospitalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rolemasters", rolemasterRoutes);

app.use(errorHandler);

module.exports = app;
