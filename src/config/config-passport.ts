const config = require("./config.json");

const clientID = config.google.client_id;
const clientSecret = config.google.client_secret;

export { clientID, clientSecret };