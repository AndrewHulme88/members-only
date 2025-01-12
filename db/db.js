const { Pool } = require("pg");

const pool = new Pool({ connectionString: "postgresql:andrew:mydb@localhost:5432/members_only_db" });

module.exports = pool;
