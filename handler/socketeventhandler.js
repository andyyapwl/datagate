const logger = require("../logger");
const constants = require("../constants");

class SocketEventHandler {
  constructor(dataMessageRepository, userSocketManager,fileManager) {
    this.dataMessageRepository = dataMessageRepository;
    this.userSocketManager = userSocketManager;
    this.fileManager = fileManager;
  }

  async handleJoin(userId, socket) {
    try {
      socket.emit("joined", "1");

      this.userSocketManager.dropDeadSocket();
      this.userSocketManager.addUserSocket(userId, socket);

      logger.info(
        "User id: " +
          userId +
          " socket id:" +
          socket.id +
          " joined! Active connection:" +
          this.userSocketManager.userSockets.length
      );

      const pendingMessages =
        await this.dataMessageRepository.getPendingMessagesForUser(userId);
      logger.info("Total pending data messages: " + pendingMessages.length);
      for (const dataMessage of pendingMessages) {
        //logger.info("dataMessage.body.startsWith(constants.FILE_PREFIX):" + (dataMessage.body.startsWith(constants.FILE_PREFIX)) + " dataMessage.body: " + dataMessage.body + " constants.FILE_PREFIX:" + constants.FILE_PREFIX);
        if (dataMessage.body.startsWith(constants.FILE_PREFIX)) {
          // Extract path after 'file://'
          let filePath = dataMessage.body.substring(constants.FILE_PREFIX.length);
          // Read file content
          let fileContent = this.fileManager.readFileContent(filePath);
          //logger.info("fileContent:" + fileContent);
          // Set dataMessage.body to fileContent
          dataMessage.body = fileContent;
          //logger.info("Sending message body: " + dataMessage.body);
        }
        socket.emit("message", dataMessage);
      }

      const messagesForAcknowledgment =
        await this.dataMessageRepository.getMessagesForSenderAcknowledgment(
          userId
        );
      logger.info(
        "Total data messages to be sender acknowledged: " +
          messagesForAcknowledgment.length
      );
      messagesForAcknowledgment.forEach((dataMessage) => {
        socket.emit("delivered", dataMessage.id);
        logger.info("Send id " + dataMessage.id + " back to sender to ack");
      });
    } catch (error) {
      logger.error("Error handling join:", error);
    }
  }
}

module.exports = SocketEventHandler;
