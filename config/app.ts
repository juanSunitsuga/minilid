import jwt from "jsonwebtoken";

export const appConfig = {
    jwtSecret: "easy-job-search",
    jwtExpiration: 60 * 60 * 1000,
    generateAccessToken: (userId: string) => {
        const payload = { id: userId };
        return jwt.sign(payload, appConfig.jwtSecret, { expiresIn: appConfig.jwtExpiration });
    }
}