const mysql = require("mysql");
const logger = require("./logger");
 
class DatabaseManager {
  static connect() {
    const dbConfig = {
      host: "localhost",
      user: "root",
      password: "",
      database: "datamessage_db",
    };
    const connection = mysql.createConnection(dbConfig);
    connection.connect((err) => {
      if (err) {
        logger.error("Error connecting to the database:", err);
        return;
      }
      logger.info("Connected to the database");
    });
    return connection;
  }
}
module.exports = DatabaseManager;
