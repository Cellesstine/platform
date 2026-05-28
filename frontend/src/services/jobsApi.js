import api from "./api";

export async function listAnnouncements(params = {}) {
  const { data } = await api.get("/jobs/", { params });
  return Array.isArray(data) ? data : [];
}

export async function createAnnouncement(payload) {
  const { data } = await api.post("/jobs/", payload);
  return data;
}

export async function publishAnnouncement(id) {
  const { data } = await api.post(`/jobs/${id}/publish/`);
  return data;
}

export async function closeAnnouncement(id) {
  const { data } = await api.post(`/jobs/${id}/close/`);
  return data;
}

export async function deleteAnnouncement(id) {
  await api.delete(`/jobs/${id}/`);
}
