import { Request, Response, NextFunction } from "express";

const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error){
    res.status(res.locals.errorCode || 500).json({message: error.message});
    }
}

export default errorHandler;