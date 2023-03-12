import {client} from "./account";

class AccountService {
    isMock: boolean;
    constructor(isMock: boolean) {
        this.isMock = isMock;
    }


    public signIn(memberID: number, memberName: string, email: string, password: string, birthday: string){
        if(this.isMock){
            return new Promise((resolve, reject) => {
                const model =  {
                    memberID,
                    memberName,
                    email,
                    password,
                    birthday
                }
                resolve(model);
            });
        }else{
            return client.query(
                `INSERT INTO schema1.account
                         ("memberid", "membername", "email", "password", "birthday")
                     VALUES ('${memberID}', '${memberName}', '${email}', '${password}', '${birthday}
                             ')`).then((data: any) => {
                console.log(data);
                return {
                    memberID,
                    memberName,
                    email,
                    password,
                    birthday
                }
            })
        }



    }
}

export { AccountService };