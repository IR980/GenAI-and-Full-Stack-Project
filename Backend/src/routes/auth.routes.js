const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

const router = Router();
router.post("/register", authController.userRegister);
router.post("/login", authController.userLogin);
router.post("/logout", authController.userLogout);
router.get("/get-me", authUser, authController.getMe);
module.exports = router;
