import {AccountRepository} from "./account-repository";

class AccountService {
    constructor(public accountRepo: AccountRepository) {
    }

    findOne(id: string){
        return this.accountRepo.findOne(id);
    }
    findAll(){
        return this.accountRepo.findAll();
    }
}

export { AccountService };