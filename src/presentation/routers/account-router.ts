import express, { Request, Response } from 'express';
import { PostgreSql } from "../../data/postgresql/postgresql";
import { user, host, password, port } from "../../config/config-postgres";

const PSQL = new PostgreSql(user, host, password, port);
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