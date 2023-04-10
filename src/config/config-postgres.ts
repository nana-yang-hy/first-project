const config = require("./config.json");
const user = config.pg.user;
const host = config.pg.host;
const password = config.pg.password;
const port = config.pg.port;

export { user, host, password, port }