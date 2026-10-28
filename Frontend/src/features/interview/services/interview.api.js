import { api } from "../../auth/services/auth.api";

export async function generateInterviewReport({
  jobDescription,
  selfDescription,
  resumeFile,
}) {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  formData.append("resume", resumeFile);
  return (await api.post("/api/interview", formData)).data;
}
export async function getInterviewReportById(interviewId) {
  return (await api.get(`/api/interview/report/${interviewId}`)).data;
}
export async function getAllInterviewReports() {
  return (await api.get("/api/interview")).data;
}
export async function downloadTailoredResume(interviewReportId) {
  return (
    await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
      responseType: "blob",
    })
  ).data;
}
