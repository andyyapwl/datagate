const logger = require("../logger");

class DeliveredHandler {
  constructor(socket, dataMessageRepository, userSocketManager) {
    this.socket = socket;
    this.dataMessageRepository = dataMessageRepository;
    this.userSocketManager = userSocketManager;
  }

  async handleDelivered(messageId) {
    logger.info("Data acknowledged by for message id:" + messageId);
    try {
      await this.dataMessageRepository.updateStatusToDelivered(messageId);
      await this.handleDeliveredQueryResults(messageId);
    } catch (error) {
      logger.error("Error updating data to status=Delivered:", error);
    }
  }

  async handleDeliveredQueryResults(messageId) {
    try {
      const dataMessage = await this.dataMessageRepository.findById(messageId);
      if (dataMessage && dataMessage.type === "SendOnly") {
        await this.handleSendOnlyMessage(dataMessage);
      } else {
        this.notifySenderDelivered(dataMessage);
      }
    } catch (error) {
      logger.error("Error fetching pending data:", error);
    }
  }

  async handleSendOnlyMessage(dataMessage) {
    try {
      await this.dataMessageRepository.deleteById(dataMessage.id);
      logger.info(
        "Data Message SendOnly id:" +
          dataMessage.id +
          " was successfully deleted."
      );
    } catch (error) {
      logger.error("Error deleting data:", error);
    }
  }

  notifySenderDelivered(dataMessage) {
    const senderUserSockets = this.userSocketManager.getUserSockets(
      dataMessage.fromId
    );
    for (const senderSocket of senderUserSockets) {
      senderSocket.socket.emit("delivered", dataMessage.id);
    }
  }
}
module.exports = DeliveredHandler;
