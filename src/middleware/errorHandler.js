const errorHandler = (err, req, res, next) => {
  const now = new Date();

  console.error(`ERROR ${req.method} ${req.originalUrl} ${err.message}`);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
