import api from "./api";
import { getUserEmail, getIndividualProfileId, setIndividualProfileId } from "./auth";

export async function listApplications(params = {}) {
  const { data } = await api.get("/jobs/applications/", { params });
  return Array.isArray(data) ? data : [];
}

/** Resolve individual profile UUID from prior applications (same email). */
export async function syncIndividualProfileId() {
  const cached = getIndividualProfileId();
  if (cached) return cached;

  const email = getUserEmail();
  if (!email) return null;

  try {
    const applications = await listApplications();
    const match = applications.find(
      (app) => app.applicant_email?.toLowerCase() === email.toLowerCase()
    );
    if (match?.applicant) {
      setIndividualProfileId(match.applicant);
      return match.applicant;
    }
  } catch {
    // Caller handles missing applicant id.
  }
  return null;
}

export async function createApplication({ announcementId, coverLetter, resumeFile, applicantId }) {
  const applicant = applicantId || (await syncIndividualProfileId());
  if (!applicant) {
    const err = new Error("Individual profile not found.");
    err.code = "MISSING_APPLICANT";
    throw err;
  }

  const hasFile = resumeFile instanceof File;
  let payload;
  let config;

  if (hasFile) {
    payload = new FormData();
    payload.append("announcement", announcementId);
    payload.append("applicant", applicant);
    payload.append("cover_letter", coverLetter || "");
    payload.append("resume_file", resumeFile);
    config = { headers: { "Content-Type": "multipart/form-data" } };
  } else {
    payload = {
      announcement: announcementId,
      applicant,
      cover_letter: coverLetter || "",
    };
  }

  const { data } = await api.post("/jobs/applications/", payload, config);
  if (data?.applicant) {
    setIndividualProfileId(data.applicant);
  }
  return data;
}
