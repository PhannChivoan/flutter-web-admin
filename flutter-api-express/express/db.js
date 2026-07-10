// Migrations
// npm install express mysql2
// npm install express pg 

const { Pool } = require("pg");

const db = new Pool({
    host : "localhost",
    user : "postgres",
    password : "3108",
    database : "flutter_db",
    port : 5432
});

module.exports = db

// mysql
// const mysql = require("mysql2");

// const db = mysql.createPool({
//     host     : "localhost",
//     user     : "root",
//     password : "3108",
//     database : "flutter_db",
//     port     : 3306
// });

// module.exports = db;