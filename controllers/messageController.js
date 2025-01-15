const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { body, validationResult } = require("express-validator");

module.exports = {
  newMessage: (req, res) => {
    if (!req.user) {
      return res.redirect("/users/login");
    }
    res.render("new-message", { errors: [], title: "", text: "" });
  },

  createMessage: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("text").trim().notEmpty().withMessage("Message text required"),

    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("new-message", {
          errors: errors.array(),
          title: req.body.title,
          text: req.body.text
        });
      }

      try {
        const { title, text } = req.body;
        const userId = req.user.id;
        await pool.query(
          "INSERT INTO messages (user_id, title, text, created_at) VALUES ($1, $2, $3, NOW())",
          [userId, title, text]
        );
        res.redirect("/");
      } catch (err) {
        console.error("Error creating message", err);
        res.status(500).send("Error creating message");
      }
    }
  ],

  deleteMessage: async (req, res) => {
    if (req.user && req.user.admin) {
      const messageId = parseInt(req.body.messageId, 10);

      if (isNaN(messageId)) {
        return res.status(400).send("Invalid message ID.");
      }

      try {
        await pool.query("DELETE FROM messages WHERE id = $1", [messageId]);
        res.redirect("/");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting message");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  }
};
