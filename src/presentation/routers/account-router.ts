import express, {Request, Response} from 'express';
import {Database} from "../../data/postgresql/database";
import {PostgreSql} from "../../data/postgresql/postgresql";
// import {AccountService} from "../../account/account-service";

const PG_USER = process.env.PG_USER as string;
const PG_HOST = process.env.PG_HOST as string;
const PG_PASSWORD = process.env.PG_PASSWORD as string;
const PG_PORT: number = process.env.PG_PORT as unknown as number;
const PSQL = new PostgreSql(PG_USER, PG_HOST, PG_PASSWORD, PG_PORT);
const router = express.Router();

(async () => {
    try {
        console.log("PSQL connecting")
    } catch (e) {
        console.log(e);
    }
})();

router.get('/', async (req: Request, res: Response) => {
    try {
        return res.render("account-login");
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.get('/users', async (req: Request, res: Response) => {
    try {
        let users = await PSQL.getUsers('schema1.users');
        console.log(users);
    } catch (e) {
        console.log(e);
    }
})

// router.post('/',async (req: Request, res: Response) => {
//     try {
//         let {userID, userName, email, password, birthday} = req.body;
//         let insertUser = await PSQL.connectDatabase().db.query()
//     }catch (e){
//
//     }
// })


module.exports = router;