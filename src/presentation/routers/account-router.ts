import express from 'express';
import {AccountController} from "../../controllers/account-controller";
import {verifiedUser} from "../../middlewares/verifiedUser.middleware";
import {superUser} from "../../middlewares/superUser.middleware";

const router = express.Router();
const session = require("express-session");
const accountController = new AccountController();

router.use(
    session({
        secret: "123",
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false},
    })
);

// const superUser = (req: any, res:Response, next: NextFunction) => {
//     if(req.session.superVerified){
//         next();
//     }else{
//         return res.send('使用者尚無權限瀏覽此頁面')
//     }
// }

router.get('/', verifiedUser, accountController.getHomePageController.default);
router.get('/users', superUser, accountController.getUserProfileController.allUsers)
router.get('/:user_id', verifiedUser, accountController.getUserProfileController.default)

router.post('/',accountController.createUserController.default);
router.post('/log-in',accountController.logInController.default);

router.patch('/:user_id', verifiedUser, accountController.updateUserController.default);

router.delete('/:user_id/delete', verifiedUser, accountController.deleteUserController.default);

module.exports = router;