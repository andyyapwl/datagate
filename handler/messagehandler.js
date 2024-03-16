const DataMessage = require("../model/datamessage");
const FileManager = require("../filemanager");
const logger = require("../logger");

class MessageHandler {
  constructor(socket, dataMessageRepository, userSocketManager) {
    this.socket = socket;
    this.dataMessageRepository = dataMessageRepository;
    this.userSocketManager = userSocketManager;
    this.fileManager = new FileManager();
  }

  async handleMessage(jsonData) {
    let dataMessage = null;
    try {
      dataMessage = new DataMessage(JSON.parse(jsonData));
    } catch (err) {
      logger.error(err);
      dataMessage = new DataMessage(jsonData);
    }

    logger.info(
      "Incoming message from " +
        dataMessage.fromId +
        " from_others:" +
        dataMessage.from_others +
        " msgSize:" +
        dataMessage.msgSize +
        " timestamp:" +
        dataMessage.sentTimestamp
    );

    // Check if message already exists in the database
    try {
      // Check if message already exists in the database
      const existingMessage = await this.dataMessageRepository.findById(
        dataMessage.id
      );
      if (existingMessage) {
        logger.info(`Warning: Message ID ${dataMessage.id} already exists!. Will delete and re-insert again from current message request`);
        await this.dataMessageRepository.deleteById(dataMessage.id);
      }
    } catch (error) {
      logger.error("Error handling message:", error);
    }

    // Save content to file
    const newDataMessage = {...dataMessage};
    //logger.info("newDataMessage.body: " + newDataMessage.body);
    const filePath = await this.fileManager.saveContentToFile(newDataMessage);
    newDataMessage.body = filePath;
    // Insert dataMessage into the database
    await this.dataMessageRepository.insert(newDataMessage);

    // Emit acknowledgment
    this.socket.emit("gateway_acknowledge", dataMessage.id);

    // Broadcast message to recipient's sockets
    this.userSocketManager.broadcastMessage(dataMessage);
  }
}
module.exports = MessageHandler;
