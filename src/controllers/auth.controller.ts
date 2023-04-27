import {UserService} from "../data/services/user.service";
import {user, host, password, port} from "../config/config-postgres";
import {UserDto} from "../data/model/user-dto";
import {NextFunction, Request, Response} from "express";

const request = require('request');

export class AuthController {
    table = 'schema1.users'

    private userService = new UserService(user, host, password, port);

    public authenticate = {
        default: async (req: Request, res: Response) => {
            let user = req.user! as UserDto;
            let options = {
                url: 'https://people.googleapis.com/v1/people/me?',
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`
                },
                qs:{
                    personFields: 'birthdays',
                }
            };
            request.get(options, async (error: any, response: Response, body: string) => {

                if (error) {
                    console.error(error);
                    return res.status(500).send('Internal Server Error');
                }

                let foundUser = await this.userService.findUserByGoogleId(this.table, user.googleId);

                if(!foundUser){
                    let result = JSON.parse(body);
                    let number : number = 0;
                    for(let i = 0; i < result.birthdays.length; i++){
                        let type = result.birthdays[i].metadata.source.type;
                        if(type === 'ACCOUNT') {
                            number = i;
                            break;
                        }
                        if(i == result.birthdays.length - 1 && type !== 'ACCOUNT')
                        return res.status(400).send('Error with get birthday')
                    }
                    let year = result.birthdays[number].date.year;
                    let month = result.birthdays[number].date.month;
                    let day = result.birthdays[number].date.day;
                    user.birthday = `${year}-${month}-${day}`;
                    await this.userService.createUser(this.table, user);
                    let newUser = await this.userService.getUser(this.table, user.userId);
                    console.log('-----------------newUser:');
                    console.log(newUser);
                }

                req.session!.isVerified = true;
                return res.status(200).redirect('/users/');
            })
        },

        local: (req: Request, res: Response) => {
            try {
                let {option} = req.body;
                let user = req.user! as UserDto;
                let userId = user.userId;
                req.session!.isVerified = true;

                if (option == 'super') {
                    req.session!.superUser = true;

                    return res.status(200).json({
                        msg: 'super log in success',
                        userId,
                        code: 'L003'
                    });
                }

                return res.status(200).json({
                    msg: 'log in success',
                    userId: userId,
                    code: 'L001'
                });
            } catch (e) {
                return res.status(500).json({
                    msg: 'log in failed',
                    errorMessage: e,
                    code: 'L002'
                });
            }

        },

        logout: (req: Request, res: Response, next: NextFunction) => {
            req.logout(function (err) {

                if (err) {
                    return next(err);
                }

                return res.status(200).json({
                    msg: 'log out success',
                    code: 'L004'
                })
            });
        },
    }
}