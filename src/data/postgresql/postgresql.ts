import {Client, QueryResult} from "pg";
import {AccountDto} from "../model/account-dto";

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
        this.db.connect()
            .then(data => {
                console.log("Db connect success!!!!")
            })
            .catch(error => {
                console.error("DB connect Error!!!!!");
            });
    }

    public async getAllUsers(db_table: string) {
        try {
            let users = await this.db.query(`SELECT *
                                             FROM ${db_table}`);
            let result = PostgreSql.mapAccountResult(users);
            return result;
        } catch (e) {
            return e;
        }

    }

    public async getUser(db_table: string, user_id: string): Promise<AccountDto[]> {
        try {
            await this.db.query('BEGIN');
            let user = await this.db.query(`SELECT *
                                            FROM ${db_table}
                                            WHERE user_id = $1`, [user_id]);
            let result = PostgreSql.mapAccountResult(user);
            await this.db.query('COMMIT');
            return result;
        } catch (e) {
            await this.db.query('ROLLBACK');
            throw e;
        }
    }

    public async getUserId(db_table: string, email: string): Promise<string> {
        try {
            await this.db.query('BEGIN');
            let userid = await this.db.query(`SELECT user_id
                                              FROM ${db_table}
                                              WHERE email = $1`, [email]);
            await this.db.query('COMMIT');
            return userid.rows[0].user_id;
        } catch (e) {
            await this.db.query('ROLLBACK');
            throw e;
        }
    }

    public async createUser(db_table: string,
                            account: AccountDto): Promise<number> {
        try {
            console.log('hi');
            await this.db.query(`ALTER TABLE ${db_table} DROP CONSTRAINT IF EXISTS check_not_null;
            ALTER TABLE ${db_table}
                ADD CONSTRAINT check_not_null CHECK (username <> '' and email <> '');
            `);
            let newUser = await this.db.query(`INSERT INTO ${db_table}
                                               VALUES ($1,$2,$3,$4,$5);
            `,[account.userId,account.username,account.email,account.userHashedPassword,account.birthday]);
            return newUser.rowCount;
        } catch (e) {
            console.error(e)
            throw e;
        }
    }

    public async updateUser(db_table: string, user_id: string, content: Record<string, any>): Promise<number> {
        {
            try {
                let rowCount: number = 0;
                await Promise.all(Object.entries(content).map(async ([key, value]) => {
                        if (value !== undefined && value !== "") {
                            await this.db.query(`UPDATE ${db_table}
                                                 SET ${key} = '${value}'
                                                 WHERE user_id = $1`, [user_id]);
                            rowCount++;
                        }
                    }
                ))
                console.log(rowCount);
                return rowCount;
            } catch (e) {
                throw e;
            }
        }
    }

    public async deleteUser(db_table: string,
                            user_id: string) {
        try {
            return await this.db.query(`DELETE
                                        FROM ${db_table}
                                        WHERE user_id = $1`, [user_id]);
        } catch (e) {
            return e;
        }
    }

    public async checkEmail(db_table: string,
                            email: string) {
        try {
            let existedEmail: boolean = false;
            let checkEmail = await this.db.query(`SELECT *
                                                  FROM ${db_table}
                                                  WHERE email = $1`, [email]);
            let result = checkEmail.rows.map(content => ({
                email: content.email,
            }));
            if (result.length !== 0 && result[0].email == email) {
                existedEmail = true;
            }
            return existedEmail;
        } catch (e) {
            return e;
        }
    }

    public async currentPassword(db_table: string, user_id: string): Promise<string> {
        try {
            let result = await this.db.query(`SELECT user_hashed_password
                                              FROM ${db_table}
                                              WHERE user_id = $1`, [user_id]);
            let mappedResult = PostgreSql.mapAccountResult(result)
            return mappedResult[0].userHashedPassword;
        } catch (e) {
            throw e;
        }
    }

    private static mapAccountResult =
        (res: QueryResult): AccountDto[] => res.rows.map(r => ({
            userId: r.user_id,
            username: r.username,
            email: r.email,
            userHashedPassword: r.user_hashed_password,
            birthday: r.birthday
        }));
}

