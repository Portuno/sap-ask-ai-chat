import { MabotClient } from "./client";

export const mabotConfig = {
  baseUrl: import.meta.env?.VITE_MABOT_API_URL,
  username: import.meta.env?.VITE_MABOT_USERNAME,
  password: import.meta.env?.VITE_MABOT_PASSWORD,
  botUsername: import.meta.env?.VITE_MABOT_BOT_USERNAME,
};

export const mabot = (() => {
  // En dev, permite usar proxy local para evitar CORS si la URL apunta al host de producción
  const rawBase = mabotConfig.baseUrl ?? "";
  let baseUrl = rawBase;
  if (import.meta.env?.DEV && rawBase.startsWith("https://mabot.app")) {
    try {
      const u = new URL(rawBase);
      const path = u.pathname?.replace(/\/$/, "") || "";
      baseUrl = `/mabot${path}` || "/mabot";
    } catch {
      baseUrl = "/mabot";
    }
  }
  if (!baseUrl) {
    // We instantiate with empty baseUrl to avoid runtime errors if unused;
    // callers should check config before use.
    return new MabotClient({ baseUrl: "" });
  }
  return new MabotClient({ baseUrl });
})();

export const ensureMabotLogin = async (): Promise<void> => {
  if (!mabotConfig.baseUrl) throw new Error("Falta VITE_MABOT_API_URL");
  if (!mabot.isAuthenticated()) {
    if (!mabotConfig.username || !mabotConfig.password) {
      throw new Error("Faltan VITE_MABOT_USERNAME o VITE_MABOT_PASSWORD para login automático");
    }
    await mabot.login(mabotConfig.username, mabotConfig.password);
  }
}; 