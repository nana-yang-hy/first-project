import express, {NextFunction, Request, Response} from 'express';
import {PostgreSql} from '../../data/postgresql/postgresql';
import {user, host, password, port} from '../../config/config-postgres';
import {v4 as uuidv4} from 'uuid';

const postgreSql = new PostgreSql(user, host, password, port);
const router = express.Router();
const session = require("express-session");
const bcrypt = require("bcrypt");

(async () => {
    try {
        console.log('PSQL connecting')
    } catch (e) {
        console.log(e);
    }
})();

router.use(
    session({
        secret: "123",
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false},
    })
);

const verifiedUser = (req: any, res:Response, next: NextFunction) => {
    if(req.session.isVerified){
        next();
    }else{
        return res.send('請先登入使用者')
    }
}

// const superUser = (req: any, res:Response, next: NextFunction) => {
//     if(req.session.superVerified){
//         next();
//     }else{
//         return res.send('使用者尚無權限瀏覽此頁面')
//     }
// }

router.get('/', async (req: Request, res: Response) => {
    try {
        return res.render('./account/account-login');
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.get('/users', async (req: Request, res: Response) => {
    try {
        let users = await postgreSql.getAllUsers('schema1.users');
        return res.status(200).render('./account/account-users');
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.get('/sign-in', (req: Request, res: Response) => {
    return res.render('./account/account-sign-in');
})

router.get('/:user_id', verifiedUser, async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        let getUser: any = await postgreSql.getUser('schema1.users', user_id);
        return res.status(200).render('./account/account-user-page', {getUser});
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.get('/:user_id/update', async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        let getUser = await postgreSql.getUser('schema1.users', user_id);
        return res.status(200).render('./account/account-edit-user', {getUser});
    } catch (e) {
        return res.status(500).send(e);
    }
})


router.post('/', async (req: Request, res: Response) => {
    try {
        let user_id = uuidv4();
        let {user_name, email, password, birthday} = req.body;
        await postgreSql.createUser('schema1.users', user_id, user_name, email, password, birthday);
        let getUser = await postgreSql.getUser('schema1.users', user_id);
        return res.status(200).render('./account/account-new', {getUser});
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.post('/log-in', async (req: any, res: Response) => {
    try {
        let { email, password } = req.body
        let checkEmail: any = await postgreSql.checkEmail('schema1.users', email);
        let existedEmail = checkEmail.rowCount;
        if(existedEmail === 0){
            return res.status(400).send('此email尚未註冊使用者')
        }else{
            let checkPassword = checkEmail[0].password;
            // let verified = await bcrypt.compare(password, checkPassword);
            if(password == checkPassword){
                req.session.isVerified = true;
                return res.send('您已登入系統');
            }
        }
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.put('/:user_id', async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        let {username, email, password, birthday} = req.body;
        await postgreSql.updateUser('schema1.users', user_id, {username, email, password, birthday});
        let getUser: any = await postgreSql.getUser('schema1.users', user_id);
        return res.status(200).render('./account/account-user-update',{ getUser });
    } catch (e) {
        return res.status(500).send(e);
    }
})
router.delete('/:user_id', async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        await postgreSql.deleteUser('schema1.users', user_id);
        return res.status(200).render('./account/account-user-delete');
    } catch (e) {
        return res.status(500).send(e);
    }
})
module.exports = router;