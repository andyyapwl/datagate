const logger = require("../logger");

class SenderAcknowledgementHandler {
  constructor(socket, dataMessageRepository, userSocketManager) {
    this.socket = socket;
    this.dataMessageRepository = dataMessageRepository;
    this.userSocketManager = userSocketManager;
  }

  async handleSenderAcknowledgement(messageId) {
    logger.info("Data acknowledged by sender for messageId: " + messageId);
    try {
      // await this.dataMessageRepository.deleteById(messageId);
      // logger.info("Encrypted data deleted from MySQL for acknowledged sender");
      await this.dataMessageRepository.updateStatusToAcknowledged(messageId);
      logger.info("Updated message " + messageId + " to 'Acknowledged'.");
    } catch (error) {
      logger.error("Error deleting data:", error);
    }
  }
}
module.exports = SenderAcknowledgementHandler;
