import { UpdateIn, UpdateOut, Token, TextContent } from "./types";

export type MabotClientOptions = {
  baseUrl: string;
  storage?: Storage;
};

const ACCESS_TOKEN_KEY = "mabot_access_token";
const REFRESH_TOKEN_KEY = "mabot_refresh_token";

export class MabotClient {
  private baseUrl: string;
  private storage: Storage;

  constructor(options: MabotClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.storage = options.storage ?? localStorage;
  }

  private get accessToken(): string | null {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  private set accessToken(token: string | null) {
    if (!token) {
      this.storage.removeItem(ACCESS_TOKEN_KEY);
      return;
    }
    this.storage.setItem(ACCESS_TOKEN_KEY, token);
  }

  private get refreshToken(): string | null {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  private set refreshToken(token: string | null) {
    if (!token) {
      this.storage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    this.storage.setItem(REFRESH_TOKEN_KEY, token);
  }

  readonly isAuthenticated = (): boolean => {
    return Boolean(this.accessToken && this.refreshToken);
  };

  readonly logout = (): void => {
    this.accessToken = null;
    this.refreshToken = null;
  };

  private readonly withApiFallback = (urlBase: string): string => {
    if (urlBase.endsWith("/api")) return urlBase;
    return `${urlBase}/api`;
  };

  readonly login = async (username: string, password: string): Promise<void> => {
    const doLogin = async (base: string) => {
      const body = new URLSearchParams();
      body.set("grant_type", "password");
      body.set("username", username);
      body.set("password", password);

      const response = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
      });
      return response;
    };

    // First attempt with current baseUrl
    let response = await doLogin(this.baseUrl);

    // If not ok, throw detailed error
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`MABOT login failed: ${response.status} ${text?.slice(0, 200)}`);
    }

    // If response is not JSON (likely HTML), retry with '/api' suffix
    let contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const fallbackBase = this.withApiFallback(this.baseUrl);
      const fallbackResp = await doLogin(fallbackBase);
      if (!fallbackResp.ok) {
        const text = await fallbackResp.text().catch(() => "");
        throw new Error(`MABOT login failed (fallback): ${fallbackResp.status} ${text?.slice(0, 200)}`);
      }
      contentType = fallbackResp.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await fallbackResp.text().catch(() => "");
        throw new Error(`MABOT login returned non-JSON (fallback): ${fallbackResp.status} ${text?.slice(0, 200)}`);
      }
      // Persist new base
      this.baseUrl = fallbackBase;
      response = fallbackResp;
    }

    const data = (await response.json()) as Token;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
  };

  private readonly refreshTokens = async (): Promise<void> => {
    const refresh = this.refreshToken;
    if (!refresh) throw new Error("No refresh token available");

    const doRefresh = async (base: string) =>
      fetch(`${base}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });

    let response = await doRefresh(this.baseUrl);

    if (!response.ok) {
      // Try fallback '/api'
      const fallbackBase = this.withApiFallback(this.baseUrl);
      const fb = await doRefresh(fallbackBase);
      if (!fb.ok) {
        this.logout();
        const text = await fb.text().catch(() => "");
        throw new Error(`MABOT refresh failed: ${fb.status} ${text?.slice(0, 200)}`);
      }
      this.baseUrl = fallbackBase;
      response = fb;
    }

    // Some deployments may return an empty body on 200. Try to parse JSON, but tolerate empty.
    let tokenData: Partial<Token> = {};
    try {
      const text = await response.text();
      if (text && text.trim().length > 0) {
        const parsed = JSON.parse(text) as Token | Record<string, unknown>;
        tokenData = parsed as Token;
      }
    } catch {
      // ignore parse errors
    }
    if (tokenData?.access_token && tokenData?.refresh_token) {
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
    }
  };

  private readonly authorizedFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const makeRequest = async (base: string): Promise<Response> => {
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(init?.headers as Record<string, string>),
      };
      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
      }
      const requestInit: RequestInit = { ...init, headers };
      return fetch(`${base}${path}`, requestInit);
    };

    let response = await makeRequest(this.baseUrl);
    if (response.status === 401 && this.refreshToken) {
      await this.refreshTokens();
      response = await makeRequest(this.baseUrl);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      // Try fallback '/api' once for non-OK responses as well
      const fallbackBase = this.withApiFallback(this.baseUrl);
      if (!this.baseUrl.endsWith("/api")) {
        const fb = await makeRequest(fallbackBase);
        if (fb.ok) {
          this.baseUrl = fallbackBase;
          response = fb;
        } else {
          throw new Error(`MABOT request failed: ${response.status} ${text}`);
        }
      } else {
        throw new Error(`MABOT request failed: ${response.status} ${text}`);
      }
    }

    let contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      // Try fallback '/api' if not already using it
      if (!this.baseUrl.endsWith("/api")) {
        const fallbackBase = this.withApiFallback(this.baseUrl);
        const fb = await makeRequest(fallbackBase);
        if (!fb.ok) {
          const text = await fb.text().catch(() => "");
          throw new Error(`MABOT non-JSON response (fallback failed): ${fb.status} ${text?.slice(0, 200)}`);
        }
        contentType = fb.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await fb.text().catch(() => "");
          throw new Error(`MABOT non-JSON response (after fallback): ${fb.status} ${text?.slice(0, 200)}`);
        }
        this.baseUrl = fallbackBase;
        response = fb;
      } else {
        const text = await response.text().catch(() => "");
        throw new Error(`MABOT non-JSON response: ${response.status} ${text?.slice(0, 200)}`);
      }
    }

    return (await response.json()) as T;
  };

  readonly sendWebMessage = async (params: {
    text: string;
    botUsername?: string | null;
    chatId?: string | null;
    platformChatId?: string | null;
    prefixWithBotName?: boolean;
  }): Promise<UpdateOut> => {
    const content: TextContent = { type: "text", value: params.text };
    const body: UpdateIn = {
      platform: "web",
      chat_id: params.chatId ?? null,
      platform_chat_id: params.platformChatId ?? null,
      messages: [
        {
          role: "user",
          contents: [content],
        },
      ],
      bot_username: params.botUsername ?? null,
      prefix_with_bot_name: Boolean(params.prefixWithBotName),
    };

    return this.authorizedFetch<UpdateOut>(`/io/input`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };
} 