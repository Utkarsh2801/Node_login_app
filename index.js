const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const port = process.env.PORT || 3000;
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const passport = require("passport");

app.set("view engine", "ejs");

app.set("views", "views");
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: Date.now() + 3600000 },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

mongoose
  .connect(process.env.MONGOURI, { useNewUrlParser: true })
  .then(db => {
    console.log("Database Connected!");
  })
  .catch(err => {
    console.log(err);
  });

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_message");
  res.locals.error_messages = req.flash("error_message");
  next();
});

app.use(passport.initialize());
app.use(passport.session());
require("./authentication").authentication(app, passport);
app.use("/", require("./routes/routes")(passport));

app.listen(port, () => {
  console.log("Server is running");
});
