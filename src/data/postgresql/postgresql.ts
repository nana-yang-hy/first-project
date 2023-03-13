import {Database} from "./database";
import {Client} from "pg";

export class PostgreSql extends Database {
    db: Client
    constructor(user: string, host: string, password: string, port: number) {
        super(user, host, password, port);
        this.db = new Client({
            user: this.user,
            host: this.host,
            password: this.password,
            port: this.port
        })
        this.db.connect();
    }

    public async getUsers(db_table: string) {
        try{
            let users = await this.db.query(`SELECT * FROM ${db_table}`);
            let result = users.rows.map( content => ({
                    userid: content.userid,
                    username: content.username,
                    email: content.email,
                    password: content.password,
                    birthday: content.birthday
                }
            ))
            return result;
        }catch (e) {
            return e;
        }

    }
}