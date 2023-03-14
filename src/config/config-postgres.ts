const config = require("./config.json");
const user = config.pg_user;
const host = config.pg_host;
const password = config.pg_password;
const port = config.pg_port;

export { user, host, password, port }