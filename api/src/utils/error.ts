import * as e from "express";
import logger from "./logger";

export class ValidationError extends Error {
  status: number;
  detail: any;
  constructor(message: string | undefined, detail?: any, status: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.detail = detail;
    this.status = status;
  }
}

export interface IError extends Error {
  status?: number;
  detail?: any;
}

export const ErrorHandler = (
  err: IError | ValidationError,
  req: e.Request,
  res: e.Response,
  next: e.NextFunction
) => {
  const error: IError | ValidationError = err;
  if (res) {
    res.status(error.status ?? 500).json({
      success: false,
      message: "Internal server error",
      detail: error.detail ?? [],
    });
  }
  logger.error(String(error.status), error.message);
};
