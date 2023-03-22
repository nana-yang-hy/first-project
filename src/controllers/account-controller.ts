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
                    let userId = req.session?.userId;
                    return res.status(200).json({
                        msg: 'To go list',
                        url: {
                            calendar: '/calendar',
                            map: '/map',
                            profile: `/account/${userId}`
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
                        msg: 'super log in success',
                        code: 'L003'
                    })
                }
                req.session!.isVerified = true;
                req.session!.userId = userId;
                return res.json({
                    msg: 'log in success',
                    code: 'L001'
                })
            } catch (e) {
                return res.json({
                    msg: 'log in failed',
                    errorMessage: e,
                    code: 'L002'
                })
            }
        }
    }

    public getUserProfileController = {
        default: async (req: Request, res: Response) => {
            try {
                let userId = req.session!.userId;
                let getUser: any = await this.postgreSql.getUser('schema1.users', userId);
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

    public logOutController = {
        default: async (req: Request, res: Response) => {
            try{
                req.session!.isVerified = false;
                return res.status(200).json({
                    msg:'log out success',
                    code:'L004'
                })
            }catch (e) {
                return res.status(500).json({
                    msg:'log out failed',
                    code:'L005'
                })
            }
        }
    }
    public createUserController = {
        default: async (req: Request, res: Response) => {
            try {
                let userId = uuidv4();
                let {username, email, password, birthday} = req.body;
                let userHashedPassword = await this.hashedPassword(password);
                await this.postgreSql.createUser('schema1.users', {userId, username, email, userHashedPassword, birthday});
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
                let userId = req.session!.userId;
                let {username, email, new_password, birthday, confirm_password} = req.body;
                let currentPassword = await this.postgreSql.currentPassword('schema1.users', userId);
                let passwordCorrect = await this.checkPassword(confirm_password, currentPassword);
                if (passwordCorrect) {
                    let userHashedPassword = await this.hashedPassword(new_password);
                    await this.postgreSql.updateUser('schema1.users', userId, {
                        username,
                        email,
                        user_hashed_password: userHashedPassword,
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
                let userId = req.session!.userId;
                let {password} = req.body;
                let currentPassword = await this.postgreSql.currentPassword('schema1.users', userId);
                let passwordCorrect = await this.checkPassword(password, currentPassword);
                if (passwordCorrect) {
                    await this.postgreSql.deleteUser('schema1.users', userId);
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


    private async hashedPassword(plainPassword: string): Promise<string> {
        let hashedPassword = '';
        if (plainPassword !== '') {
            hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        }
        return hashedPassword;
    }

    private async checkPassword(confirmPassword: string, currentPassword: string): Promise<boolean> {
        try {
            if (confirmPassword == '') {
                return false;
            }
            return await bcrypt.compare(confirmPassword, currentPassword);
        } catch (e) {
            return false;
        }
    }
}
