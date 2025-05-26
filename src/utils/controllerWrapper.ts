import { NextFunction, Request, Response } from "express";

type ExpressRouteHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T> | T;

export function controllerWrapper<T>(routeHandler: ExpressRouteHandler<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await routeHandler(req, res, next);

      // Only send response if headers not already sent
      if (!res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      // Only pass to error handler if headers not already sent
      if (!res.headersSent) {
        next(error);
      } else {
        console.error("Error occurred after headers sent:", error);
      }
    }
  };
}
