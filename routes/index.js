var express = require("express");
var router = express.Router();

// index
router.get("/", (req, res) => {
  var isLogin = false;
  if (req.user) {
    isLogin = true;
    console.log(req.user);
  }
  res.render("index", { isLogin: isLogin });
});

// test
router.get("/test", async (req, res) => {

  res.render("test", { isLogin: req.isAuthenticated() });
});

module.exports = router;
