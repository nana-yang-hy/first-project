import {Client} from "pg";

export class PostgreSql {
    db: Client
    user: string
    host: string
    password: string
    port: number

    constructor(user: string, host: string, password: string, port: number) {
            this.user = user,
            this.host = host,
            this.password = password,
            this.port = port,
            this.db = new Client({
                user,
                host,
                password,
                port,
            })
        this.db.connect();
    }

    public async getUsers(db_table: string) {
        try {
            let users = await this.db.query(`SELECT *
                                             FROM ${db_table}`);
            let result = users.rows.map(content => ({
                    userid: content.userid,
                    username: content.username,
                    email: content.email,
                    password: content.password,
                    birthday: content.birthday
                }
            ))
            return result;
        } catch (e) {
            return e;
        }

    }
}