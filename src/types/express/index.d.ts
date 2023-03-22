import {AccountDto} from "../../data/model/account-dto";

export {}

declare global {
    namespace Express {
        export interface Request {
            session?: AccountDto & { isVerified?: boolean } & {superUser?: boolean}
        }
    }
}