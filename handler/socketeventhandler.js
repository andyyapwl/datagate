const logger = require("../logger");

class SocketEventHandler {
  constructor(dataMessageRepository, userSocketManager) {
    this.dataMessageRepository = dataMessageRepository;
    this.userSocketManager = userSocketManager;
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
          userSockets.length
      );

      const pendingMessages =
        await this.dataMessageRepository.getPendingMessagesForUser(userId);
      logger.info("Total pending data messages: " + pendingMessages.length);
      pendingMessages.forEach((dataMessage) => {
        socket.emit("message", dataMessage);
      });

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
