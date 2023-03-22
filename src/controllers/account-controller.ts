import {Request, Response} from "express";
import {PostgreSql} from "../data/postgresql/postgresql";
import {host, password, port, user} from "../config/config-postgres";
import {v4 as uuidv4} from "uuid";

const bcrypt = require("bcrypt");
const saltRounds = 12;

export class AccountController {

    private postgreSql = new PostgreSql(user, host, password, port);

    public getHomePageController = {
        default: async (req: Request, res: Response) => {
            {
                try {
                    let user_id = req.session?.userId;
                    return res.status(200).json({
                        msg: 'To go list',
                        url: {
                            calendar: '/calendar',
                            map: '/map',
                            profile: `/account/${user_id}`
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
            }
        }
    }

    public logInController = {
        default: async (req: Request, res: Response) => {
            try {
                let {email, password, option} = req.body
                let checkEmail = await this.postgreSql.checkEmail('schema1.users', email);
                if (!checkEmail) {
                    return res.status(400).json({
                        msg:'incorrect email or password',
                        code:'E004'
                    })
                }
                let userId = await this.postgreSql.getUserId('schema1.users', email);
                let currentPassword = await this.postgreSql.currentPassword('schema1.users',userId)
                let checkPassword = await this.checkPassword(password,currentPassword);
                if (!checkPassword) {
                    return res.status(400).json({
                        msg:'incorrect email or password',
                        code:'E004'
                    })
                }
                if (option == 'super'){
                    req.session!.superUser = true;
                    req.session!.isVerified = true;
                    req.session!.userId = userId;
                    return res.json({
                        msg: 'super login success',
                        code: 'L003'
                    })
                }
                req.session!.isVerified = true;
                req.session!.userId = userId;
                return res.json({
                    msg: 'login success',
                    code: 'L001'
                })
            } catch (e) {
                return res.json({
                    msg: 'login failed',
                    errorMessage: e,
                    code: 'L002'
                })
            }
        }
    }

    public getUserProfileController = {
        default: async (req: Request, res: Response) => {
            try {
                let {user_id} = req.params;
                let getUser: any = await this.postgreSql.getUser('schema1.users', user_id);
                return res.json({
                    msg: 'get profile success',
                    obj: getUser,
                    code: 'G003'
                });
            } catch (e) {
                return res.status(500).json({
                    msg: 'get profile failed',
                    code: 'G004'
                });
            }
        },
        allUsers: async (req: Request, res: Response) => {
            try {
                let users = await this.postgreSql.getAllUsers('schema1.users');
                return res.status(200).json({
                    msg: `get all users' profiles success`,
                    obj: users,
                    code: 'G005'
                });
            } catch (e) {
                return res.status(500).json({
                    msg: 'get profile failed',
                    code: 'G004'
                });
            }
        }
    }
    public createUserController = {
        default: async (req: Request, res: Response) => {
            try {
                let user_id = uuidv4();
                let {user_name, email, password, birthday} = req.body;
                let myHashPassword = await this.hashPassword(password);
                await this.postgreSql.createUser('schema1.users', user_id, user_name, email, myHashPassword, birthday);
                return res.status(200).json({
                    msg: 'sign in success',
                    code: 'C001'
                })
            } catch (e: any) {
                if (e.code == 23505) {
                    return res.status(400).json({
                        msg: 'email has been used',
                        code: 'E001'
                    });
                } else if (e.code == 22007 || e.code == 23502 || e.code == 42710) {
                    return res.status(400).json({
                        msg: 'field cannot be empty',
                        code: 'E002'
                    });
                }
                return res.status(500).json({
                    msg: 'error occurred while sign in',
                    code: 'C002'
                });
            }
        }
    }
    public updateUserController = {
        default: async (req: Request, res: Response) => {
            try {
                let {user_id} = req.params;
                let {username, email, new_password, birthday, confirm_password} = req.body;
                let currentPassword = await this.postgreSql.currentPassword('schema1.users', user_id);
                let passwordCorrect = await this.checkPassword(confirm_password, currentPassword);
                if (passwordCorrect) {
                    let myHashPassword = await this.hashPassword(new_password);
                    await this.postgreSql.updateUser('schema1.users', user_id, {
                        username,
                        email,
                        password: myHashPassword,
                        birthday
                    });
                    return res.status(200).json({
                        msg: 'update success',
                        code: 'U001'
                    });
                } else if (!passwordCorrect) {
                    return res.status(400).json({
                        msg: 'incorrect password',
                        code: 'E003'
                    });
                }
            } catch (e) {
                return res.status(500).json({
                    msg: 'error occurred while updating',
                    code: 'U002'
                });
            }
        }
    }

    public deleteUserController = {
        default: async (req: Request, res: Response) => {
            try {
                let {user_id} = req.params;
                let {password} = req.body;
                let currentPassword = await this.postgreSql.currentPassword('schema1.users', user_id);
                let passwordCorrect = await this.checkPassword(password, currentPassword);
                if (passwordCorrect) {
                    await this.postgreSql.deleteUser('schema1.users', user_id);
                    return res.status(200).json({
                        msg: 'delete user success',
                        code: 'D001'
                    });
                } else if (!passwordCorrect) {
                    return res.status(200).json({
                        msg: 'incorrect password',
                        code: 'E003'
                    });
                }
            } catch
                (e) {
                return res.status(500).json({
                    msg: 'error occurred while deleting user',
                    code: 'D002'
                });
            }
        }
    }


    private async hashPassword(plainPassword: string): Promise<string> {
        let hashPassword = '';
        if (plainPassword !== '') {
            hashPassword = await bcrypt.hash(plainPassword, saltRounds);
        }
        return hashPassword;
    }

    private async checkPassword(confirmPassword: string, currentPassword: string): Promise<boolean> {
        try {
            if (confirmPassword == '') {
                return false;
            }
            console.log(confirmPassword);
            console.log(currentPassword);
            let answer = await bcrypt.compare(confirmPassword, currentPassword);
            console.log(answer);
            return answer;
        } catch (e) {
            return false;
        }
    }
}
