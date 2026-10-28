const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies?.token;
  if (!token)
    return res.status(401).json({ message: "Please log in to continue." });

  try {
    const blacklisted = await blacklistTokenModel.exists({ token });
    if (blacklisted)
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({
        message: "Your session is invalid or expired. Please log in again.",
      });
  }
}

module.exports = { authUser, auhtUser: authUser };
