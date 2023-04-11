import express from 'express';
import {Request, Response} from "express";
import "../../middlewares/passport"
import {UserDto} from "../../data/model/user-dto";

const router = express.Router();
const passport = require('passport');

router.get('/login-failed', (req: Request, res: Response) => {
    return res.status(200).json({
        msg: 'log in failed',
        code: 'L002'
    })
});


router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login-failed',
}), (req: Request, res: Response) => {
    let {option} = req.body;
    let user = req.user! as UserDto[];
    let userId = user[0].userId;
    req.session!.isVerified = true;
    console.log(option);

    if (option == 'super') {
        req.session!.superUser = true;
    }

    return res.status(200).json({
        msg: 'log in success',
        userId: userId,
        code: 'L001'
    });
});

module.exports = router;