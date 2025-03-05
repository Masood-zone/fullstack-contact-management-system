const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
// Load environment variables
dotenv.config();

// Passport config
require("./config/passport")(passport);
const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(ejsLayouts);
app.set("layout", "main/layout");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contacts");
app.use("/", authRoutes);
app.use("/", contactRoutes);

// Error handling middleware
app.use((req, res) => {
  res.status(404).render("partials/error", {
    message: "Page not found",
    error: {},
    title: "404 Not Found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("partials/error", {
    message: "Something went wrong!",
    error: err,
    title: "Error",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
