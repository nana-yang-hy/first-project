import express, {Request, Response} from 'express';
import {PostgreSql} from "../../data/postgresql/postgresql";
import {user, host, password, port} from "../../config/config-postgres";

const postgreSql = new PostgreSql(user, host, password, port);
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
        let users = await postgreSql.getAllUsers('schema1.users');
        return res.status(200).send(users);
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.get('/:user_id', async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        let getUser = await postgreSql.getUser('schema1.users', user_id);
        return res.status(200).send(getUser);
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.post('/', async (req: Request, res: Response) => {
    try {
        let {user_id, user_name, email, password, birthday} = req.body;
        let createUser = await postgreSql.createUser('schema1.users', user_id, user_name, email, password, birthday);
        return res.status(200).send({ msg: 'create user success', obj: createUser });
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.put('/:user_id', async (req: Request, res: Response) => {
    try{
        let { user_id }= req.params;
        let { username, email, password, birthday } = req.body;
        let updateUser = await postgreSql.updateUser('schema1.users', user_id, { username, email, password, birthday });
        return res.status(200).send({ msg: 'update user success', obj: updateUser });
    }catch (e) {
        return res.status(500).send(e);
    }
})
router.delete('/:user_id', async (req: Request, res: Response) => {
    try{
        let { user_id } = req.params;
        await postgreSql.deleteUser('schema1.users', user_id);
        return res.status(200).send('delete user success');
    }catch (e) {
        return res.status(500).send(e);
    }
})
module.exports = router;