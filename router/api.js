const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ message: `Hi there, Hello ${req.user.username}` });
});

module.exports = router;
