import {NextFunction, Response} from "express";

export const verifiedUser = (req: any, res: Response, next: NextFunction) => {
    if (req.session.isVerified) {
        return next();
    } else {
        return res.status(400).json({
            msg: 'please login before access this page',
            code: 'V001'
        });
    }
};