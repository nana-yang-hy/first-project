import "../../middlewares/passport"
import express from 'express';
import {Request, Response} from "express";
import {UserDto} from "../../data/model/user-dto";
import {clientID, clientSecret} from '../../config/config-passport'
import {AuthController} from "../../controllers/auth.controller";

const router = express.Router();
const passport = require('passport');
const authController = new AuthController();
const request = require('request');

router.get('/login-failed', (req: Request, res: Response) => {
    return res.status(200).json({
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

router.get("/google/redirect", passport.authenticate("google"), (req: Request, res: Response) => {
    let user = req.user! as UserDto;
    let options = {
        url: 'https://people.googleapis.com/v1/people/me?',
        headers: {
            'Authorization': `Bearer ${user.accessToken}`
        },
        qs:{
            personFields: 'birthdays',
        }
    };
    request.get(options, (error: any, response: Response, body: string) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
        let result = JSON.parse(body);
        let year = result.birthdays[0].date.year;
        let month = result.birthdays[0].date.month;
        let day = result.birthdays[0].date.day;

        console.log('----------------birthday:');
        console.log(`${year}-${month}-${day}`);

        return res.status(200).json({
            msg:'redirect success'
        })
    })
})

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

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {

        if (err) {
            return next(err);
        }

        return res.status(200).json({
            msg: 'log out success',
            code: 'L004'
        })
    });
});

module.exports = router;