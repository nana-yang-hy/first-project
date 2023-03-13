import {urlencoded} from "express";
import {Database} from "./data/postgresql/database";

require('dotenv').config();

const express = require('express');
const app = express();
const accountRoute = require('../src/presentation/routers/account-router')
// const PG_USER = process.env.PG_USER as string;
// const PG_HOST = process.env.PG_HOST as string;
// const PG_PASSWORD = process.env.PG_PASSWORD as string;
// const PG_PORT: number = process.env.PG_PORT as unknown as number;
// const PSQL = new Database(PG_USER, PG_HOST, PG_PASSWORD, PG_PORT)
// const PSQL = new Database("postgres", "localhost", "psqlbynana", 5432)

// PSQL.connectDatabase();

// app.set("views","../views")
app.set("view engine", "ejs");
app.use(urlencoded({extended: true}));
app.use(express.json());
app.use('/account', accountRoute);
app.listen(3000, () => {
    console.log("listening...")
});

