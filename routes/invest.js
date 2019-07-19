const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

router.get("/invest", ensureAuthenticated, (req, res) => {
  //to make sure the user is logged in
  res.render("invest", {
    user: req.user
  });
});
module.exports = router;
