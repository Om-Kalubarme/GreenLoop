import { ZodError } from 'zod';

/**
 * Global API Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log server errors in development/production
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] ${req.method} ${req.url}:`, err);
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors,
    });
  }

  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body',
    });
  }

  // Handle PostgreSQL unique constraint violations (code 23505)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'A record with this information already exists',
      detail: err.detail,
    });
  }

  // Handle PostgreSQL foreign key violations (code 23503)
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced entity does not exist',
    });
  }

  // Custom status code if assigned on error object
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
  });
};
