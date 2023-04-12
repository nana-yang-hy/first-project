import express from 'express';
import {UserController} from "../../controllers/user.controller";
import {verifiedUser} from "../../middlewares/verifiedUser.middleware";
import {superUser} from "../../middlewares/superUser.middleware";

const router = express.Router();
const userController = new UserController();

router.get('/', verifiedUser, userController.getHomePage.default);
router.get('/all', superUser, userController.users.getAllUsers)
router.get('/:user_id', verifiedUser, userController.users.getProfile)

router.post('/',userController.users.create);

router.patch('/:user_id', verifiedUser, userController.users.update);

router.delete('/:user_id', verifiedUser, userController.users.delete);

module.exports = router;