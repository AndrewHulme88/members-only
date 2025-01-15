const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  showHomePage: async (req, res) => {
    try {
      let messagesQuery = `
      SELECT messages.id, messages.title, messages.text, messages.created_at, users.first_name, users.last_name
      FROM messages
      JOIN users ON messages.user_id = users.id
      ORDER BY messages.created_at DESC
    `;
    const { rows: messages } = await pool.query(messagesQuery);

      res.render("index", { user: req.user, messages: messages });
    } catch (err) {
      console.error("Error fetching messages", err);
      res.status(500).send("An error occured while loading messages.");
    }
  }
};
