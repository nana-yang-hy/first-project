import {urlencoded} from "express";

require('dotenv').config();

const express = require('express');
const app = express();
const accountRoute = require('../src/presentation/routers/account-router')

// app.set("views","../views")
app.set("view engine", "ejs");
app.use(urlencoded({extended: true}));
app.use(express.json());
app.use('/account', accountRoute);
app.listen(3000, () => {
    console.log("listening...")
});

