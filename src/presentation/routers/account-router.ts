import express, {Request, Response} from 'express';
// import {AccountService} from "../../account/account-service";

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        return res.render("account-login");
    } catch (e) {
        return res.status(500).send(e);
    }
})

// router.post('/',async (req: Request, res: Response) => {
//     try {
//         let {userID, userName, email, password, birthday} = req.body;
//         let insertUser = await
//     }catch (e){
//
//     }
// })


module.exports = router;