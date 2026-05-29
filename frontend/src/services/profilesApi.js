import api from "./api";
import { parseApiError } from "./auth";

export async function setupIndividualProfile(payload) {
  let body = payload;
  let config = {};
  if (payload instanceof FormData) {
    payload.append("role", "individual");
    body = payload;
    config = { headers: { "Content-Type": "multipart/form-data" } };
  } else {
    body = {
      role: "individual",
      ...payload,
    };
  }
  const { data } = await api.post("/profile/", body, config);
  return data;
}

export async function setupEnterpriseProfile(payload) {
  const { data } = await api.post("/profile/", {
    role: "enterprise",
    ...payload,
  });
  return data;
}

export async function postIndividualProfileSetup(payload) {
  let body = payload;
  let config = {};
  if (payload instanceof FormData) {
    body = payload;
    config = { headers: { "Content-Type": "multipart/form-data" } };
  }
  const { data } = await api.post("/profile/post-setup/", body, config);
  return data;
}

export async function postEnterpriseVerification(formData) {
  const { data } = await api.post("/profile/post-setup/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateProfile(payload, partial = true) {
  const method = partial ? "patch" : "put";
  const { data } = await api[method]("/profile/edit/", payload);
  return data;
}

export async function getProfileDetails(uidb64) {
  const { data } = await api.get(`/profile/${uidb64}/`);
  return data;
}

export async function getMyProfileDetails() {
  const { data } = await api.get("/profile/me/");
  return data;
}

export async function searchSkills(query) {
  const { data } = await api.get("/profile/skills/", { params: { q: query } });
  return data;
}

export async function createSkill(payload) {
  const { data } = await api.post("/profile/skills/", payload);
  return data;
}

export { parseApiError };
