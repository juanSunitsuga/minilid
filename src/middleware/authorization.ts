import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../../config/app';
import { middlewareWrapper } from '../utils/middlewareWrapper';

export const authorization = middlewareWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            res.locals.errorCode = 401;
            throw new Error('No token provided');
        }
    }
)