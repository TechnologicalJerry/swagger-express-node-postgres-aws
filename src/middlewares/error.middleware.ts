import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    sendError(res, 'Validation error', 400, err.message);
    return;
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    sendError(res, 'Duplicate entry', 409, err.message);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  // Default error
  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const message = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  sendError(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};

