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
        res.redirect("/users");
      } catch (err) {
        console.error("Error creating message", err);
        res.status(500).send("Error creating message");
      }
    }
  ]
};
