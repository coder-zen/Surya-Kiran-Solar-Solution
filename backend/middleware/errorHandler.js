const { IMAGE_MAX_BYTES, DOCUMENT_MAX_BYTES, asMb } = require("../config/uploadLimits");

const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CastError") {
    if (err.kind === "ObjectId") {
      statusCode = 404;
      message = "Resource not found";
    } else {
      // Any other cast failure is malformed client input, not a server fault.
      // Previously these fell through as unhandled 500s — e.g. a query param
      // sent as an object (?category[$ne]=null) reaches Mongoose as {} after
      // sanitization and fails to cast to String.
      statusCode = 400;
      message = `Invalid value for '${err.path}'`;
    }
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // multer rejects an oversized file before the route runs, and its error
  // carries no status — without this it surfaced as a 500 "File too large",
  // which reads to an admin as "the site is broken" rather than "your photo
  // is too big". err.field tells us which upload it was.
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message =
      err.field === "resume"
        ? `That file is too large — resumes can be up to ${asMb(DOCUMENT_MAX_BYTES)}.`
        : `That image is too large — the limit is ${asMb(IMAGE_MAX_BYTES)}. Resize it and try again.`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
