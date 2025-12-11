export const getApiUrl = () => {
  if (typeof window === "undefined") return "http://localhost:3000";

  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  return isLocal
    ? "http://localhost:3000"
    : "https://the-dare-gambit-server-467306404204.asia-southeast1.run.app";
};

export const API_URL = getApiUrl();
