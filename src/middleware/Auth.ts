import jwt from "jsonwebtoken";
import { middlewareWrapper } from "../utils/middlewareWrapper";
import { Request, Response, NextFunction } from "express";
import { appConfig } from "../../config/app";

console.log('JWT Secret:', appConfig.jwtSecret);

// Test signing and verifying
const testToken = jwt.sign({ test: 'data' }, appConfig.jwtSecret);
console.log('Test token:', testToken);

try {
  const decoded = jwt.verify(testToken, appConfig.jwtSecret);
  console.log('Verification successful:', decoded);
} catch (err) {
  console.error('Verification failed:', err);
}

const authMiddleware = middlewareWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Received JWT token:", token);
    // Check which secret is being used
    console.log("Verifying JWT with secret:", appConfig.jwtSecret);
    // Also check appConfig secret
    console.log("AppConfig JWT secret:", appConfig.jwtSecret);

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

      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      res.locals.errorCode = 401;
      throw new Error("Invalid or expired token");
    }
  }
);

export default authMiddleware;
