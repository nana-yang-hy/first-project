import {readFile} from "fs/promises";

export class AccountRepository {
    async findOne(id: string){
        const content = await readFile('account.json','utf-8');
        const account = await JSON.parse(content);
        return account[id];
    }

    async findAll(){
        return "hi";
    }
}