import {UserDto} from "../data/model/user-dto";
import {UserService} from '../data/services/user.service';
import {AuthenticateCallback, Profile} from "passport";
import {clientID, clientSecret} from '../config/config-passport'
import {host, password, port, user} from "../config/config-postgres";
import {v4 as uuidv4} from "uuid";

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const userService = new UserService(user, host, password, port);
const table = 'schema1.users';

passport.serializeUser((user: UserDto , cb: AuthenticateCallback) => {
    console.log('Serializing user...');
    cb(null, user.userId)
});

passport.deserializeUser(async (id: string, cb: AuthenticateCallback) => {
    console.log('Deserializing user...');
    let user = await userService.getUser(table, id);
    cb(null, user);
});

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: '/auth/google/redirect'
}, async (accessToken: string, refreshToken: string, profile: Profile, cb: AuthenticateCallback) => {
    try {
        console.log(profile.id);
        let foundUser = await userService.findUserByGoogleId(table,profile.id);
        if (foundUser) {
            console.log('已註冊過使用者，無需再次註冊可直接登入');
            let user = await userService.getUserByGoogleId(table, profile.id);
            await userService.updateUser(table, user[0].userId, {access_token: accessToken ,refresh_token: refreshToken});
            user = await userService.getUser(table, user[0].userId);
            cb(null, user[0]);
        } else {
            console.log('偵測到新用戶');
            let user_id = uuidv4();
            let user = {
                userId: user_id,
                name: profile.displayName,
                email: profile.emails![0].value,
                hashedPassword: '',
                birthday: '2000-01-01',
                accessToken:accessToken,
                refreshToken:refreshToken,
                googleId: profile.id
            }
            await userService.createUser(table, user);
            cb(null, user);
        }
    } catch (e) {
        console.error(e);
    }
}));

passport.use(new LocalStrategy({
    // passport 本地登入的策略是使用 username 與 password 登入
    // 透過 usernameField 可以去指定要替換的登入條件
    usernameField: 'email'
}, async (username: string, password: string, cb: AuthenticateCallback) => {
    try {
        let checkEmail = await userService.checkEmail(table, username);
        if (checkEmail) {
            let userId = await userService.getUserId(table, username);
            let user = await userService.getUser(table, userId);
            let currentPassword = await userService.currentPassword(table, userId);
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
}));