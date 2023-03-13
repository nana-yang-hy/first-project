import {Client} from "pg";

export abstract class Database {
    user: string
    host: string
    password: string
    port: number

    constructor(user: string, host: string, password: string, port: number) {
        this.user = user;
        this.host = host;
        this.password = password;
        this.port = port;
    }
}
