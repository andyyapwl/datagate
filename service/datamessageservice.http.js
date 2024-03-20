const mysql = require("mysql");
const socketio = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");

const MessageHandler = require("../handler/messagehandler");
const DeliveredHandler = require("../handler/deliveredhandler");
const DataMessage = require("../model/datamessage");
const SenderAcknowledgementHandler = require("../handler/senderacknowledgehandler");
const DataMessageRepository = require("../repository/datamessagerepository");
const UserSocketManager = require("../usersocketmanager");
const SocketEventHandler = require("../handler/socketeventhandler");
const FileManager = require("../filemanager");
const logger = require("../logger");
const constants = require("../constants");

class DataMessageService {
  constructor() {
    this.userSockets = [];
    this.io = null;
    this.dataMessageRepository = new DataMessageRepository();
    this.userSocketManager = new UserSocketManager();
    this.fileManager = new FileManager();
    this.socketEventHandler = new SocketEventHandler(
      this.dataMessageRepository,
      this.userSocketManager,
      this.fileManager
    );
  }

  async getById(id) {
    return this.dataMessageRepository.findById(id);
  }

  startServer(port) {
    const app = express();
    app.use(cors());
    const server = http.createServer(app);

    app.get("/api/datamessages/:id", async (req, res) => {
      const id = req.params.id; // Extract the ID from the request parameters
      try {
        const dataMessage = await this.getById(id); // Call the service method to get the data message by ID
        if (dataMessage.body.startsWith(constants.FILE_PREFIX)) {
          // Extract path after 'file://'
          let filePath = dataMessage.body.substring(
            constants.FILE_PREFIX.length
          );
          // Read file content
          let fileContent = this.fileManager.readFileContent(filePath);
          //logger.info("fileContent:" + fileContent);
          // Set dataMessage.body to fileContent
          dataMessage.body = fileContent;
          //logger.info("Sending message body: " + dataMessage.body);
        }

        res.json(dataMessage); // Send the retrieved data message as JSON response
      } catch (error) {
        logger.error("Error fetching data message:", error);
        res.status(500).json({ error: "Internal server error" }); // Handle errors appropriately
      }
    });

    this.io = socketio(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      maxHttpBufferSize: 10e8,
    });

    server.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });

    this.io.on("connection", (socket) => {
      // Handle incoming socket connections
      this.handleSocketConnection(socket);
    });
  }

  handleSocketConnection(socket) {
    // Implement socket connection handling logic
    socket.on("message", async (jsonData) => {
      const messageHandler = new MessageHandler(
        socket,
        this.dataMessageRepository,
        this.userSocketManager
      );
      await messageHandler.handleMessage(jsonData);
    });

    socket.on("delivered", async (messageId) => {
      // Handle message delivery acknowledgment
      const deliveredHandler = new DeliveredHandler(
        socket,
        this.dataMessageRepository,
        this.userSocketManager
      );
      await deliveredHandler.handleDelivered(messageId);
    });

    socket.on("sender_acknowledge", async (messageId) => {
      // Handle sender acknowledgment
      const senderAcknowledgementHandler = new SenderAcknowledgementHandler(
        socket,
        this.dataMessageRepository,
        this.userSocketManager
      );
      await senderAcknowledgementHandler.handleSenderAcknowledgement(messageId);
    });

    socket.on("disconnect", () => {
      // Handle socket disconnection
      const removedUserSocket = this.userSocketManager.removeUserSocket(
        socket.id
      );
      socket.emit("left", "1");
      if (removedUserSocket != null) {
        logger.info(
          `User disconnected user: ${removedUserSocket.userId} socketid: ${socket.id} active usersockets: ${this.userSocketManager.userSockets.length}`
        );
      }
    });

    socket.on("join", async (userId) => {
      // Handle user joining
      await this.socketEventHandler.handleJoin(userId, socket);
    });
  }
  // Other methods for handling data message operations
}
module.exports = DataMessageService;
