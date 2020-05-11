const routeGuard = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/authentication/signin');
  }
};

module.exports = routeGuard;
