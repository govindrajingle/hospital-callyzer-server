const requestLogger = (req, res, next) => {
  // console.log("data from requestLogger req.body:\t", req.body);
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const now = new Date();

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
};

module.exports = requestLogger;
