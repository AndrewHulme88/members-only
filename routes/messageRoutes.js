const express = require("express");
const messageRouter = express.Router();
const messageController = require("../controllers/messageController");

messageRouter.get("/new", messageController.newMessage);
messageRouter.post("/new", messageController.createMessage);
messageRouter.post("/delete", messageController.deleteMessage);

module.exports = messageRouter;
