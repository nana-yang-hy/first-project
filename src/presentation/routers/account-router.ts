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

router.get('/', verifiedUser, accountController.getHomePageController.default);
router.get('/users', superUser, accountController.getUserProfileController.allUsers)
router.get('/log-out', accountController.logOutController.default);
router.get('/profile', verifiedUser, accountController.getUserProfileController.default)

router.post('/',accountController.createUserController.default);
router.post('/log-in',accountController.logInController.default);

router.patch('/', verifiedUser, accountController.updateUserController.default);

router.delete('/', verifiedUser, accountController.deleteUserController.default);

module.exports = router;