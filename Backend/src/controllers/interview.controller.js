const mongoose = require("mongoose");
const { PDFParse } = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res, next) {
  let parser;
  try {
    if (!req.user?.id)
      return res.status(401).json({ message: "Authentication required." });
    if (!req.file?.buffer)
      return res.status(400).json({ message: "Please upload a resume PDF." });
    const { selfDescription, jobDescription } = req.body;
    if (
      typeof selfDescription !== "string" ||
      !selfDescription.trim() ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res
        .status(400)
        .json({
          message: "Self description and job description are required.",
        });
    }
    parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
    const pdfResult = await parser.getText();
    const resumeText = pdfResult.text?.trim();
    if (!resumeText)
      return res
        .status(400)
        .json({
          message:
            "No readable text found in this PDF. If it is scanned, use a text-based PDF.",
        });

    const generated = await generateInterviewReport({
      resume: resumeText,
      selfDescription: selfDescription.trim(),
      jobDescription: jobDescription.trim(),
    });
    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: selfDescription.trim(),
      jobDescription: jobDescription.trim(),
      ...generated,
    });
    return res
      .status(201)
      .json({
        success: true,
        message: "Interview report created successfully.",
        interviewReport,
      });
  } catch (error) {
    console.error("Generate interview report error:", error);
    if (error.name === "ZodError")
      return res
        .status(502)
        .json({
          message:
            "AI returned a report in an unexpected format. Please try again.",
        });
    return next(error);
  } finally {
    if (parser)
      try {
        await parser.destroy();
      } catch (error) {
        console.warn("PDF cleanup failed:", error.message);
      }
  }
}

async function getInterviewReportByIdController(req, res, next) {
  try {
    const { interviewId } = req.params;
    if (!mongoose.isValidObjectId(interviewId))
      return res.status(400).json({ message: "Invalid interview report ID." });
    const interviewReport = await interviewReportModel
      .findOne({ _id: interviewId, user: req.user.id })
      .select("-resume -__v");
    if (!interviewReport)
      return res.status(404).json({ message: "Interview report not found." });
    return res.json({ interviewReport });
  } catch (error) {
    return next(error);
  }
}

async function getAllInterviewReportController(req, res, next) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("title matchScore createdAt updatedAt");
    return res.json({ interviewReports });
  } catch (error) {
    return next(error);
  }
}

async function generateResumePdfController(req, res, next) {
  try {
    const { interviewReportId } = req.params;
    if (!mongoose.isValidObjectId(interviewReportId))
      return res.status(400).json({ message: "Invalid interview report ID." });
    const report = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });
    if (!report)
      return res.status(404).json({ message: "Interview report not found." });
    const pdfBuffer = await generateResumePdf({
      resume: report.resume,
      selfDescription: report.selfDescription,
      jobDescription: report.jobDescription,
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=tailored_resume_${interviewReportId}.pdf`,
    });
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportController,
  generateResumePdfController,
};
