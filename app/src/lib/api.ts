import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 백엔드 베이스 URL 자동 추론
//  - 웹: localhost:4000
//  - 실기기(Expo Go): Metro 호스트(IP)에서 포트만 4000으로 (같은 Wi-Fi 필요)
//  - 자동 추론이 안 되면 아래 FALLBACK 을 PC의 LAN IP로 바꿔주세요.
const FALLBACK_HOST = "http://localhost:4000";
function resolveHost(): string {
  // 웹
  if (Platform.OS === "web") {
    // 배포: Express가 웹과 API를 같은 도메인에서 서빙 → same-origin
    if (!__DEV__ && typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    // 로컬 개발: API는 4000 포트
    return FALLBACK_HOST;
  }
  // 네이티브(Expo Go/빌드앱): 배포 백엔드 주소를 환경변수로 주입
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, "");
  // 로컬 개발: Metro 호스트(IP)의 4000 포트
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any)?.expoGoConfig?.debuggerHost ||
    "";
  const host = String(hostUri).split(":")[0];
  return host ? `http://${host}:4000` : FALLBACK_HOST;
}
export const API_BASE = resolveHost() + "/api";

const USER_KEY = "stafin.userId";

let cachedUserId: string | null = null;

export async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  try {
    cachedUserId = await AsyncStorage.getItem(USER_KEY);
  } catch {
    cachedUserId = null;
  }
  return cachedUserId;
}
export async function setUserId(id: string | null) {
  cachedUserId = id;
  try {
    if (id) await AsyncStorage.setItem(USER_KEY, id);
    else await AsyncStorage.removeItem(USER_KEY);
  } catch {
    /* storage 미가용 시 메모리 캐시만 사용 */
  }
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const uid = await getUserId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (uid) headers["x-user-id"] = uid;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${path}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, body?: any) => req<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  base: API_BASE,
};
