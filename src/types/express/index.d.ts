import {UserDto} from "../../data/model/user-dto";

export {}

declare global {
    namespace Express {
        export interface Request {
            session?: UserDto & { isVerified?: boolean } & {superUser?: boolean},
            user?: UserDto | UserDto[]
        }
    }
}