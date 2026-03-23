const mysql = require("mysql2");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Trantung09112005@",
    database: "techstore"
});
module.exports = db;