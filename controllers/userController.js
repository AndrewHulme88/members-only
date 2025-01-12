const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
      [firstName, lastName, email, password]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error adding user", err);
    res.status(500).json({ error: "Failed to add user" });
  }
};
