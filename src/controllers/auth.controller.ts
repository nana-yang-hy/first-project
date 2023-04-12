import {UserService} from "../data/services/user.service";
import {host, password, port, user} from "../config/config-postgres";

export class AuthController {
    table = 'schema1.users'

    private userService = new UserService(host, password, port, user);

    public tokens = {
        update: async (userId: string, accessToken: string) => {
            try {
                await this.userService.updateUser(this.table, userId, { accessToken });
                return true;
            } catch (e) {
                console.error(e);
                return false;
            }
        }
    }

}