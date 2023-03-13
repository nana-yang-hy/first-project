import express, {Request, Response} from 'express';
import {AccountService} from "../../account/account-service";

const router = express.Router();

export function AccountRouter(accountService: AccountService) {

    router.get('/', async (req: Request, res: Response) => {
        try {
            const content = await accountService.findAll();
            res.send(content);
        } catch (e) {
            res.status(500).send(e);
        }
    })
    router.get('/:id', async (req: Request, res: Response) => {
        try {
            let {id} = req.params;
            const content = await accountService.findOne(id);
            res.send(content);
        } catch (e) {
            res.status(500).send(e);
        }
    })
}

module.exports = router;