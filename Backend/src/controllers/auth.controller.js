const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklist.model");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 3 * 24 * 60 * 60 * 1000,
  path: "/",
});
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});
const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

async function userRegister(req, res, next) {
  try {
    let { username, email, password } = req.body;
    username = typeof username === "string" ? username.trim() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (
      !username ||
      !email ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Username, valid email, and password (at least 8 characters) are required.",
      });
    }
    const exists = await userModel.findOne({ $or: [{ username }, { email }] });
    if (exists)
      return res
        .status(409)
        .json({ message: "That username or email is already registered." });

    const user = await userModel.create({
      username,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res.cookie("token", createToken(user), cookieOptions());
    return res.status(201).json({
      message: "Account created successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function userLogin(req, res, next) {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password = req.body.password;
    const user = await userModel.findOne({ email });
    if (
      !user ||
      typeof password !== "string" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    res.cookie("token", createToken(user), cookieOptions());
    return res.json({
      message: "Logged in successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function userLogout(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (token)
      await blacklistTokenModel.updateOne(
        { token },
        { $setOnInsert: { token } },
        { upsert: true },
      );
    res.clearCookie("token", cookieOptions());
    return res.json({ message: "Logged out successfully." });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id).select("username email");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { userRegister, userLogin, userLogout, getMe };
