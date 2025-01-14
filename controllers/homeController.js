const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  showHomePage: async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const { rows: messages } = await pool.query("SELECT * FROM messages ORDER BY created_at DESC");
        return res.render("index", { user: req.user, messages });
      }
      res.render("index", { user: null, messages: [] });
    } catch (err) {
      console.error("Error fetching messages", err);
      res.status(500).send("An error occured while loading messages.");
    }
  }
};
