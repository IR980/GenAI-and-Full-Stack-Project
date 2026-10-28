import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  getAllInterviewReports,
  getInterviewReportById,
  generateInterviewReport,
  downloadTailoredResume,
} from "../services/interview.api";

export function useInterview() {
  const { interviewId } = useParams();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const generateReport = useCallback(async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await generateInterviewReport(payload);
      setReport(data.interviewReport);
      return data.interviewReport;
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate report.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const getReportById = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const data = await getInterviewReportById(id);
      setReport(data.interviewReport);
      return data.interviewReport;
    } catch (err) {
      setError(err.response?.data?.message || "Could not load report.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const getReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllInterviewReports();
      setReports(data.interviewReports || []);
      return data.interviewReports || [];
    } catch (err) {
      setError(err.response?.data?.message || "Could not load reports.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const getResumePdf = useCallback((id) => downloadTailoredResume(id), []);
  useEffect(() => {
    if (interviewId) getReportById(interviewId).catch(() => {});
    else getReports().catch(() => {});
  }, [interviewId, getReportById, getReports]);
  return {
    loading,
    report,
    reports,
    error,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
  };
}
