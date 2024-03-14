const DataMessage = require("../model/datamessage");
const logger = require("../logger");

class DataMessageRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "SELECT * FROM data_table WHERE id = ?",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.length > 0) {
              resolve(new DataMessage(results[0]));
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async deleteById(id) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "DELETE FROM data_table WHERE id = ?",
        [id],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async insert(dataMessage) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "INSERT INTO data_table (id, from_id, to_id, body, status, action, type, table_code, title, options, msg_size, sent_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          dataMessage.id,
          dataMessage.fromId,
          dataMessage.toId,
          dataMessage.body,
          dataMessage.status,
          dataMessage.action,
          dataMessage.type,
          dataMessage.tableCode,
          dataMessage.title,
          dataMessage.options,
          dataMessage.msgSize,
          dataMessage.sentTimestamp,
        ],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
  async updateStatusToDelivered(messageId) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "UPDATE data_table SET status = 'Delivered' WHERE id = ?",
        [messageId],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updateStatusToAcknowledged(messageId) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "UPDATE data_table SET status = 'Acknowledged' WHERE id = ?",
        [messageId],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getPendingMessagesForUser(userId) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "SELECT * FROM data_table WHERE to_id = ? AND status='Sending'",
        [userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
  }

  async getMessagesForSenderAcknowledgment(userId) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "SELECT * FROM data_table WHERE from_id = ? AND status='Delivered'",
        [userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
  }
}
module.exports = DataMessageRepository;
