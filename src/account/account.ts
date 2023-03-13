import {Request, Response} from "express";
import {AccountService} from "./account-service";

require("dotenv").config({path: "../../.env"});
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const {Client, Pool} = require("pg");
const client = new Client(
    {
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
    }
)
const accountService = new AccountService(false);
try {
    client.connect();
    console.log("connecting to psql...")
} catch (e) {
    console.log(e)
}

function getHomePage(): any {
    app.get("/", (req: Request, res: Response) => {
        return res.send("hi")
    })
}

getHomePage();

function signIn(): any {
    app.post("/signIn", async (req: Request, res: Response) => {
        try {
            let {memberID, memberName, email, password, birthday} = req.body;
            let newMember = await accountService.signIn(memberID, memberName, email, password, birthday);
            return res.status(200).send({msg: "sign in succeed", obj: newMember});
        } catch (e) {
            console.log(e)
            return res.status(500).send(e);
        }
    })
}

signIn();

function getMember(): any {
    app.get("/:memberID", async (req: Request, res: Response) => {
        try {
            const memberID = req.params;
            let member = await client.query(`SELECT *
                                             FROM member
                                             WHERE memberid = ${memberID};`);
            return res.status(200).send(member)
        } catch (e) {
            return res.status(500).send("error");
        }
    })
}


export {client, getHomePage, signIn, getMember};