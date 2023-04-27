import {urlencoded} from "express";

const express = require('express');
const app = express();
const userRoute = require('./presentation/routers/user.router');
const authRoute = require('./presentation/routers/auth.router');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

app.use(
    session({
        secret: "123",
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false},
    })
);

app.use(urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }) );
app.use(passport.initialize());
app.use(passport.session());
app.use('/member-system/users', userRoute);
app.use('/member-system/auth', authRoute);

app.listen(8081, () => {
    console.log('listening...')
});

