const fs = require("fs");
const path = require("path");
const logger = require("./logger");

class FileManager {
  constructor() {}

  readFileContent(filePath) {
    try {
      // Read the content of the file synchronously
      const content = fs.readFileSync(filePath, "utf8");
      return content;
    } catch (error) {
      // Handle errors, such as file not found or permission issues
      console.error("Error reading file:", error);
      return null;
    }
  }

  async saveContentToFile(dataMessage) {
    try {
      // Get the timestamp from the data message
      const timestamp = dataMessage.sentTimestamp;
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero if month is less than 10

      // Create the directory if it doesn't exist
      const directory = path.join(__dirname, `contentfiles/${year}-${month}`);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Generate the file path based on the data message ID
      const filePath = path.join(directory, `${dataMessage.id}.txt`);

      // Write the content to the file
      fs.writeFileSync(filePath, dataMessage.body);

      // Set the relative file path to the data message's content field
      //dataMessage.body = `file://${filePath}`;
      return `file://${filePath}`;
      logger.info(`Body saved to file: ${filePath}`);
    } catch (error) {
      logger.error("Error saving body to file:", error);
    }
    return null;
  }
}

module.exports = FileManager;
