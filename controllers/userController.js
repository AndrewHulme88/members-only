const passport = require("passport");
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      console.log("Database query result:", rows);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }

      const match = await bcrypt.compare(password, user.password);
      console.log("Password match result:", match);
      if (!match) {
        return done(null, false, { message: "Incorrect Password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = {
  home: (req, res) => {
    res.render("index", { user: req.user });
  },

  signUpForm: (req, res) => {
    res.render("sign-up-form");
  },

  signUp: async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
        [firstName, lastName, email, hashedPassword]
      );
      res.redirect("/users/login");
    } catch (err) {
      console.error("Error adding user", err);
      res.status(500).json({ error: "Failed to add user" });
    }
  },

  loginForm: (req, res) => {
    res.render("login");
  },

  login: (req, res, next) => {
    console.log("Received login data:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }

      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.redirect("/users/login");
      }

      console.log("Authentication successful for user:", user);
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }

        console.log("User logged in successfully:", user);
        return res.redirect("/users");
      });
    })(req, res, next);
  },

  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/users");
    });
  }
};
