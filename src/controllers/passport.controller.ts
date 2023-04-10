import {UserDto} from "../data/model/user-dto";

const passport = require('passport');
const GoogleStrategy = require('passportController-google-oauth20').Strategy;
const LocalStrategy = require('passportController-local');
const bcrypt = require('bcrypt');

import {UserService} from '../data/services/user.service';
import {clientID, clientSecret} from '../config/config-passport'
import {host, password, port, user} from "../config/config-postgres";
import {v4 as uuidv4} from "uuid";
import {AuthenticateCallback, Profile} from "passport";

export class PassportController {
    table = 'schema1.users'

    private userService = new UserService(user, host, password, port);

    public passports = {
        serializeUser: passport.serializeUser((user: UserDto, cb: AuthenticateCallback) => {
            console.log('Serializing user...');
            cb(null, user.userId)
        }),

        deserializeUser: passport.deserializeUser(async (_id: string, cb: AuthenticateCallback) => {
            console.log('Deserializing user...');
            let user = await this.userService.getUser(this.table, _id);
            cb(null, user);
        }),

        googleLogin: passport.use(new GoogleStrategy({
            clientID: clientID,
            clientSecret: clientSecret,
            callBackUrl: '/auth/google/redirect'
        }, async (accessToken: string, refreshToken: string, profile: Profile, cb: AuthenticateCallback) => {
            try {
                let foundUser = await this.userService.getUser(this.table, profile.id);
                if (foundUser) {
                    console.log('已註冊過使用者，無需再次註冊可直接登入');
                    let storeRefreshToken = await this.userService.updateUser(this.table, profile.id, {refresh_token: refreshToken});
                    cb(null, storeRefreshToken);
                } else {
                    console.log('偵測到新用戶');
                    let user_id = uuidv4();
                    let user = {
                        userId: user_id,
                        name: profile.displayName,
                        email: profile.emails![0].value,
                        hashedPassword: '',
                        birthday: '0000-00-00',
                        accessToken,
                        refreshToken,
                        googleId: profile.id
                    }
                    let newUser = await this.userService.createUser(this.table, user);
                    cb(null, newUser);
                }
            } catch (e) {
                console.error(e);
            }
        })),
        localLogin: passport.use(new LocalStrategy(async (email: string, password: string, cb: AuthenticateCallback) => {
            try {
                let checkEmail = await this.userService.checkEmail(this.table, email);
                if (checkEmail) {
                    let userId = await this.userService.getUserId(this.table, email);
                    let user = await this.userService.getUser(this.table, userId);
                    let currentPassword = await this.userService.currentPassword(this.table, userId);
                    let checkPassword = await bcrypt.compare(password, currentPassword);

                    if (checkPassword) {
                        cb(null, user);
                    } else {
                        cb(null, false);
                    }

                } else {
                    cb(null, false);
                }
            } catch (e) {
                console.error(e);
            }
        }))
    }
}