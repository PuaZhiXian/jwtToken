const mysql = require('mysql');
const {env} = require("process");

const con = mysql.createConnection({
    host: env.DATABASE_HOST,
    port:env.DATABASE_PORT,
    user: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD
});

con.connect(function(err) {
    if (err) throw err;
    console.log("connected mysql on host " + env.DATABASE_HOST + ' port '+ env.DATABASE_PORT);
});