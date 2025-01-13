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
}
