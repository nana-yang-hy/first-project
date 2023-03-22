
import express, {NextFunction, Request, Response} from 'express';
import {PostgreSql} from '../../data/postgresql/postgresql';
import {user, host, password, port} from '../../config/config-postgres';
import {v4 as uuidv4} from 'uuid';
import {QueryResult} from "pg";


const router = express.Router();
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const postgreSql = new PostgreSql(user, host, password, port);

declare var postman: any;

router.use(
    session({
        secret: "123",
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false},
    })
);

const verifiedUser = (req: any, res: Response, next: NextFunction) => {
    if (req.session.isVerified) {
        next();
    } else {
        return res.status(400).json({
            msg: 'please login before access this page',
            code: 'V002'
        })
    }
}

// const superUser = (req: any, res:Response, next: NextFunction) => {
//     if(req.session.superVerified){
//         next();
//     }else{
//         return res.send('使用者尚無權限瀏覽此頁面')
//     }
// }

router.get('/', verifiedUser, (req: Request, res: Response) => {
    try {
        let user_id = req.session?.userId;
        return res.status(200).json({
            msg: 'To go list',
            url: {
                calendar: '/calendar',
                map: '/map',
                profile: `/account/${user_id}/profile`
            },
            option: 'log-out',
            code: 'G001'
        });
    } catch (e) {
        return res.status(500).json({
            msg: 'get homepage error',
            code: 'G002'
        })
    }
});

router.get('/log-in', async (req: Request, res: Response) => {
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
        return res.json(getUser);
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

router.get('/:user_id/delete', async (req: Request, res: Response) => {
    let {user_id} = req.params;
    return res.render('./account/account-delete', {user_id});
})

router.post('/', async (req: Request, res: Response) => {
    try {
        let user_id = uuidv4();
        let {user_name, email, password, birthday} = req.body;
        let myHashPassword = await hashPassword(password);
        await postgreSql.createUser('schema1.users', user_id, user_name, email, myHashPassword, birthday);
        return res.redirect('/account')
    } catch (e: any) {
        console.log(e);
        if (e.code == 23505) {
            return res.status(400).send('此email已註冊');
        } else if (e.code == 22007 || e.code == 23502 || e.code == 42710) {
            return res.status(400).send('欄位不可為空');
        }
        return res.status(500).send('註冊發生錯誤');
    }
})

router.post('/log-in', async (req: any, res: Response) => {
    try {
        let {email, password} = req.body
        let checkEmail: any = await postgreSql.checkEmail('schema1.users', email);
        let userid: string = await postgreSql.getUserId('schema1.users', email);
        if (checkEmail == false) {
            return res.status(400).send('此email尚未註冊使用者')
        } else {
            req.session.isVerified = true;
            req.session.userId = userid;
            return res.json({
                msg: 'login success',
                code: 'L001'
            });
        }
    } catch (e) {
        return res.json({
            msg: 'login failed',
            errorMessage: e,
            code: 'L002'
        })
    }
})

router.patch('/:user_id', async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        let {username, email, new_password, birthday, confirm_password} = req.body;
        let currentPassword = await postgreSql.currentPassword('schema1.users', user_id);
        let passwordCorrect = await checkPassword(confirm_password, currentPassword);
        if (passwordCorrect) {
            let myHashPassword = await hashPassword(new_password);
            await postgreSql.updateUser('schema1.users', user_id, {
                username,
                email,
                password: myHashPassword,
                birthday
            });
            return res.send('success');
        } else if (!passwordCorrect) {
            return res.send('wrong password');
        } else {
            throw new Error('error');
        }
    } catch (e) {
        console.error(e);
        return res.status(500).send(e);
    }
})
router.delete('/:user_id/delete', async (req: Request, res: Response) => {
    try {
        let {user_id} = req.params;
        let {password} = req.body;
        let currentPassword = await postgreSql.currentPassword('schema1.users', user_id);
        let passwordCorrect = await checkPassword(password, currentPassword);
        if (passwordCorrect) {
            await postgreSql.deleteUser('schema1.users', user_id);
            return res.send('user deleted');
        } else if (!passwordCorrect) {
            return res.send('wrong password');
        } else {
            throw new Error('error');
        }
    } catch (e) {
        return res.status(500).send(e);
    }
});

async function hashPassword(plainPassword: string): Promise<string> {
    let hashPassword = '';
    if (plainPassword !== '') {
        hashPassword = await bcrypt.hash(plainPassword, saltRounds);
    }
    return hashPassword;
}

async function checkPassword(confirmPassword: string, currentPassword: string): Promise<boolean> {
    try {
        if (confirmPassword == '') {
            return false;
        }
        await bcrypt.compare(confirmPassword, currentPassword);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = router;