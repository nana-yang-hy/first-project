"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config({ path: "../../.env" });
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { Client, Pool } = require("pg");
const client = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
try {
    client.connect();
    console.log("connecting to psql...");
}
catch (e) {
    console.log(e);
}
app.get("/", (req, res) => {
    return res.send("hi");
});
app.listen(3000, () => {
    console.log("listening...");
});
