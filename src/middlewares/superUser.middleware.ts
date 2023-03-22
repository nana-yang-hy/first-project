import {NextFunction, Response} from "express";

export const superUser = (req: any, res: Response, next: NextFunction) => {
    if (req.session.superUser) {
        return next();
    } else {
        return res.status(400).json({
            msg: `sorry, you don't have permission to access this page`,
            code: 'V002'
        });
    }
};