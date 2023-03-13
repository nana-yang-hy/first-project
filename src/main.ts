import {urlencoded} from "express";
import {Client} from "pg";

require('dotenv').config();

const express = require('express');
const app = express();
const accountRoute = require('../src/presentation/routers/account-router')
const PG_PORT: number = process.env.PG_PORT as unknown as number;


const database = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: PG_PORT,
    })
database.connect();

app.set("view engine", "ejs");
app.use(urlencoded({extended: true}));
app.use(express.json());
app.use('/account', accountRoute);
app.listen(3000, () => {
    console.log("listening...")
});

