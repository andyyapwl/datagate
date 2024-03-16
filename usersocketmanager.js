const logger = require("./logger");

class UserSocketManager {
  constructor() {
    this.userSockets = [];
  }

  addUserSocket(userId, socket) {
    const item = { userId: userId, socket: socket };
    const existingIndex = this.getUserSocketIndex(socket.id);
    if (existingIndex === -1) {
      this.userSockets.push(item);
      logger.info(`User id: ${item.userId} socket.id:${socket.id} added to the connection list!`);
    } else {
      logger.info(`User id: ${item.userId} socket.id:${socket.id} already in the connection list!`);
    }
  }

  removeUserSocket(socketId) {
    const index = this.getUserSocketIndex(socketId);
    if (index > -1) {
      const removedUserSocket = this.userSockets.splice(index, 1)[0];
      if (removedUserSocket != null) {
        logger.info(`Removed socket user id: ${removedUserSocket.userId} no of sockets left: ${this.userSockets.length}`);
        return removedUserSocket;
      } else {
        logger.info(`Warning: user is null in removeUserSocket for index: ${index} no of sockets left: ${this.userSockets.length}`);
      }
    }
    return null;
  }

  getUserSocketIndex(socketId) {
    for (let i = 0; i < this.userSockets.length; i++) {
      if (this.userSockets[i].socket.id === socketId) {
        return i;
      }
    }
    return -1;
  }

  getUserSockets(userId) {
    const sockets = [];
    for (const userSocket of this.userSockets) {
      if (userSocket.userId == userId) {
        sockets.push(userSocket);
      }
    }
    return sockets;
  }

  broadcastMessage(dataMessage) {
    const toUserSockets = this.getUserSockets(dataMessage.toId);
    logger.info(`Online ${dataMessage.toId} no of sockets: ${toUserSockets.length}`);
    for (const toUserSocket of toUserSockets) {
      toUserSocket.socket.emit("message", dataMessage);
      logger.info(
        `Sending message to ${toUserSocket.userId} socket id: ${toUserSocket.socket.id} for msg id: ${dataMessage.id}`
      );
    }
  }

  dropDeadSocket() {
    for (const usocket of this.userSockets) {
      logger.info("dropdeadsocket userid: " + usocket.userId);
      if (!usocket.socket.connected || !usocket.userId) {
        logger.info("Drop deadsocket id: " + usocket.socket.id);
        removeUserSocket(usocket.socket.id);
      }
    }
  }
  
}
module.exports = UserSocketManager;

