import jwt from "jsonwebtoken";
import { middlewareWrapper } from "../utils/middlewareWrapper";
import { Request, Response, NextFunction } from "express";
import { appConfig } from "../../config/app";

const authMiddleware = middlewareWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.locals.errorCode = 401;
      throw new Error("No token provided");
    }

    try {
      // IMPORTANT: Use JWT_CONFIG.secret here, not appConfig.jwtSecret
      const decoded = jwt.verify(token, appConfig.jwtSecret) as {
        id: string;
        email?: string;
        name?: string;
      };

      if (!decoded?.id) {
        res.locals.errorCode = 401;
        throw new Error("Invalid token structure");
      }

      req.user = {
        id: decoded.id,
        email: decoded.email || "",
      };

      // next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      res.locals.errorCode = 401;
      throw new Error("Invalid or expired token");
    }
  }
);

export default authMiddleware;
