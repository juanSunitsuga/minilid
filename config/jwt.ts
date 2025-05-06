import jwt from 'jsonwebtoken';

export const jwtConfig = {
    jwtSecret: 'easy-job-search',
    jwtExpiration: 60 * 60 * 1000,
    generateAccessToken: (userData: any) => {
        return jwt.sign(userData, jwtConfig.jwtSecret, { expiresIn: '1h' });
    }
};
