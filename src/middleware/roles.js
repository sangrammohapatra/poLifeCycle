function permit(...allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user || {};
    if (!role || !allowedRoles.includes(role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

module.exports = { permit };
