const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const questionSchema = z.object({
  question: z.string().min(1),
  intention: z.string().min(1),
  answer: z.string().min(1),
});
const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestion: z.array(questionSchema),
  behavioralQuestion: z.array(questionSchema),
  skillGap: z.array(
    z.object({
      skill: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number().int().min(1),
      focus: z.string().min(1),
      tasks: z.array(z.string()),
    }),
  ),
  title: z.string().min(1),
});

function getAI() {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    const error = new Error(
      "AI service is not configured. Add GOOGLE_GENAI_API_KEY to Backend/.env.",
    );
    error.status = 503;
    throw error;
  }
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(contents, config) {
  const ai = getAI();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await ai.models.generateContent({ model, contents, config });
    } catch (error) {
      const status = Number(error.status || error.code);
      if (![429, 500, 502, 503, 504].includes(status) || attempt === 3)
        throw error;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  if (
    ![resume, selfDescription, jobDescription].every(
      (value) => typeof value === "string" && value.trim(),
    )
  ) {
    throw new Error(
      "Resume, self description, and job description are required.",
    );
  }
  const prompt = `You are an expert technical interviewer and career coach. Create a practical interview preparation report based only on the candidate information below. Do not invent experience or qualifications. Score profile alignment from 0 to 100. Include useful technical and behavioral questions, the interviewer's intention, sample answer guidance, realistic skill gaps (low/medium/high), and a day-wise preparation plan. Return only JSON matching the supplied schema.

RESUME:
${resume.slice(0, 18000)}

SELF DESCRIPTION:
${selfDescription.slice(0, 5000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 10000)}`;

  const response = await generateWithRetry(prompt, {
    responseMimeType: "application/json",
    responseJsonSchema: z.toJSONSchema(interviewReportSchema, {
      target: "draft-7",
    }),
  });
  if (!response.text) throw new Error("Gemini returned an empty response.");
  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch {
    throw new Error("Gemini returned invalid JSON. Please try again.");
  }
  return interviewReportSchema.parse(parsed);
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const htmlSchema = z.object({ html: z.string().min(1) });
  const prompt = `Create a professional ATS-friendly resume as HTML. Use only facts in the source resume and self description; do not invent qualifications. Tailor wording to the job description. Return JSON with one field html.
RESUME:
${resume.slice(0, 16000)}
SELF DESCRIPTION:
${selfDescription.slice(0, 4000)}
JOB DESCRIPTION:
${jobDescription.slice(0, 8000)}`;
  const response = await generateWithRetry(prompt, {
    responseMimeType: "application/json",
    responseJsonSchema: z.toJSONSchema(htmlSchema, { target: "draft-7" }),
  });
  const { html } = htmlSchema.parse(JSON.parse(response.text || "{}"));
  // Keep the generated document isolated and disable JavaScript execution.
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#172033;line-height:1.45}h1,h2,h3{color:#243b70}a{color:#243b70}</style></head><body>${html}</body></html>`,
      { waitUntil: "domcontentloaded" },
    );
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    });
  } finally {
    await browser.close();
  }
}

module.exports = { generateInterviewReport, generateResumePdf };
