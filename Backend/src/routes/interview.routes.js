const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const router = express.Router();
router.post(
  "/",
  authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);
router.get("/", authUser, interviewController.getAllInterviewReportController);
router.get(
  "/report/:interviewId",
  authUser,
  interviewController.getInterviewReportByIdController,
);
router.post(
  "/resume/pdf/:interviewReportId",
  authUser,
  interviewController.generateResumePdfController,
);
module.exports = router;
