// Central error handler - never leaks raw stack traces/DB errors to the client
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid data submitted', details: Object.values(err.errors).map(e => e.message) });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already in use` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier supplied' });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Something went wrong on our end. Please try again shortly.' : err.message;
  res.status(status).json({ message });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
