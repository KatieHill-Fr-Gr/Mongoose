

const isSignedIn = (req, res, next) => {
  if (req.session.user) return next();
  req.session.redirectTo = req.originalUrl; // Saves the original URL
  res.redirect("/auth/sign-in");
};

export default isSignedIn;

