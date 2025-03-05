function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please log in to view this resource");
  res.redirect("/login");
}

function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = { ensureAuthenticated, forwardAuthenticated };
