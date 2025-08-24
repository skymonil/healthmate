const BASE_URL = window._env_?.BACKEND_URL || "http://localhost:8080/api";

const API_ROUTES = {
  // Auth Routes
  register: `${BASE_URL}/auth/register`,
  verifyOtp: `${BASE_URL}/auth/verify-otp`,
  login: `${BASE_URL}/auth/login`,
  getCurrentUser: `${BASE_URL}/auth/me`,
  deleteAccount: `${BASE_URL}/auth`,

  // Diagnosis Routes
  createDiagnosis: `${BASE_URL}/diagnosis`,
  getDiagnosisHistory: `${BASE_URL}/diagnosis/history`,
  getDiagnosisById: (reportId: string) => `${BASE_URL}/diagnosis/${reportId}`,
  deleteDiagnosisById: (reportId: string) =>
    `${BASE_URL}/diagnosis/${reportId}`,
};

export { BASE_URL, API_ROUTES };
