const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const now = new Date();

    const timestamp =
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      now.getFullYear() +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
};

module.exports = requestLogger;
