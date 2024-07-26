const path = require("path");
const express = require("express");
const router = express.Router();
const pg = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
});

router.get("/type", async (req, res) => {
  const { type } = req.query;

  // return all ingredients of a type
  const { rows } = await pool.query(
    `SELECT title, image, type FROM ingredients WHERE type=$1`,
    [`${type}`]
  );

  res.json({ rows });
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  console.log("search ingredients", term, page);
  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time
  const { rows } = await pool.query(
    `SELECT *, COUNT(*) OVER ()::INT AS total_count FROM ingredients WHERE CONCAT(title, type) ILIKE $1 LIMIT 5 OFFSET ${
      page * 5
    }`,
    [`%${term}%`]
  );

  res.json({ rows });
});

module.exports = router;
