import api from "./api";
import { parseApiError } from "./auth";

export async function setupIndividualProfile(payload) {
  const { data } = await api.post("/profile/", {
    role: "individual",
    ...payload,
  });
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
  const { data } = await api.post("/profile/post-setup/", payload);
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

export { parseApiError };
