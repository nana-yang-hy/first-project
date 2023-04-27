import "../../middlewares/passport"
import express from 'express';
import {Request, Response} from "express";
import {AuthController} from "../../controllers/auth.controller";

const router = express.Router();
const passport = require('passport');
const authController = new AuthController();

router.get('/login-failed', (req: Request, res: Response) => {
    return res.status(500).json({
        msg: 'log in failed',
        code: 'L002'
    })
});

router.get("/google",
    passport.authenticate("google", {
        accessType: "offline",
        scope: ["profile", "email","https://www.googleapis.com/auth/user.birthday.read"],
        prompt: "select_account"
    }));

router.get('/google/redirect', passport.authenticate("google"), authController.authenticate.default);

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login-failed',
}), authController.authenticate.local);

router.post('/logout', authController.authenticate.logout);

module.exports = router;