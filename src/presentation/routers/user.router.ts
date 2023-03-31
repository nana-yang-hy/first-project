import express from 'express';
import {UserController} from "../../controllers/user.controller";
import {verifiedUser} from "../../middlewares/verifiedUser.middleware";
import {superUser} from "../../middlewares/superUser.middleware";

const router = express.Router();
const session = require("express-session");
const userController = new UserController();

router.use(
    session({
        secret: "123",
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false},
    })
);

router.get('/', verifiedUser, userController.getHomePage.default);
router.get('/all', superUser, userController.users.getAllUsers)
router.get('/log-out', userController.users.logOut);
router.get('/:user_id', verifiedUser, userController.users.getProfile)

router.post('/',userController.users.create);
router.post('/log-in',userController.users.logIn);

router.patch('/:user_id', verifiedUser, userController.users.update);

router.delete('/:user_id', verifiedUser, userController.users.delete);

module.exports = router;