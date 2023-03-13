import {urlencoded} from "express";

const accountRoute = require('../src/presentation/routers/account-router')


require('dotenv').config();
console.log(process.env.PG_PASSWORD);
const express = require('express');
const app = express();

app.use(urlencoded({extended: true}));
app.use(express.json());

app.use('/account', accountRoute);
app.listen(3000, () => {
    console.log("listening...")
});

