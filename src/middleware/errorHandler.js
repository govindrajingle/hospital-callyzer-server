const errorHandler = (err, req, res, next) => {
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

  console.error(
    `[${timestamp}] ERROR ${req.method} ${req.originalUrl} ${err.message}`,
  );

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
