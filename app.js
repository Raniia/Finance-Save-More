const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const averageDetails = require("./models/AverageDetails");

require("./config/passport")(passport);

const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("wow");
  })
  .catch(err => {
    console.log(err);
  });
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});

//routes
app.use(require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use(require("./routes/save-more"));

// app.use(express.static('views/css'))

const port = process.env.PORT || 4000;
app.listen(port, console.log("listen on", port));
