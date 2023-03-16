import {Client} from "pg";
import {s} from "vitest/dist/types-7cd96283";

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

    public async getAllUsers(db_table: string) {
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

    public async getUser(db_table: string, user_id: string) {
        try {
            let user = await this.db.query(`SELECT *
                                            FROM ${db_table}
                                            WHERE userid = $1`, [user_id]);
            let result = user.rows.map(content => ({
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

    public async createUser(db_table: string,
                            user_id: string,
                            user_name: string,
                            email: string,
                            password: string,
                            birthday: string) {
        try {
            await this.db.query(`INSERT INTO ${db_table}
                                 VALUES ($1, $2, $3, $4,
                                         $5)`, [user_id, user_name, email, password, birthday]
            )
            let result = this.getUser(db_table, user_id)
            return result;
        } catch (e) {
            return e;
        }
    }

    public async updateUser(db_table: string, user_id: string, content: Record<string, any>) {
        {
            try {
                await Promise.all(Object.entries(content).map(([key, value]) => {
                    if (value !== undefined && value !== "") {
                        this.db.query(`UPDATE ${db_table}
                                       SET ${key} = '${value}'
                                       WHERE userid = $1`, [user_id]);
                    }
                }));
                let result = this.getUser(db_table, user_id);
                return result;
            } catch (e) {
                return e;
            }
        }
    }

    public async deleteUser(db_table: string,
                            user_id: string) {
        try {
            let deletUser = await this.db.query(`DELETE
                                                 FROM ${db_table}
                                                 WHERE userid = $1`, [user_id]);
            return deletUser;
        } catch (e) {
            return e;
        }
    }

    public async checkEmail(db_table: string,
                            email: string) {
        try {
            let checkEmail = await this.db.query(`SELECT *
                                                  FROM ${db_table}
                                                  WHERE email = $1`, [email]);
            let result = checkEmail.rows.map(content => ({
                userid: content.userid,
                username: content.username,
                email: content.email,
                password: content.password,
                birthday: content.birthday
            }));
            return result;
        }catch (e) {
            return e;
        }
    }
}

