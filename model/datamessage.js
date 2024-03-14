class DataMessage {
  constructor(data) {
    this.id = data.id;
    this.fromId = data.from_id || data.from_others; // handle from_others fallback
    this.toId = data.to_id;
    this.body = data.body;
    this.status = "Sending"; // set default status
    this.action = data.action;
    this.type = data.type;
    this.title = data.title;
    this.tableCode = data.table_code;
    this.options = data.options;
    this.msgSize = data.msg_size;
    this.sentTimestamp = data.sent_timestamp;
  }
}
module.exports = DataMessage;