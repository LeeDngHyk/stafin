import { create } from "zustand";
import { api, setUserId } from "./api";
import type { User } from "./types";

interface AppState {
  user: User | null;
  loading: boolean;
  // 진단 진행 중 임시 답변
  answers: Record<number, { optionIndex: number; stability: number }>;
  setUser: (u: User | null) => void;
  setAnswer: (qid: number, optionIndex: number, stability: number) => void;
  clearAnswers: () => void;
  bootstrap: () => Promise<User | null>;
  login: (fresh?: boolean) => Promise<{ user: User; isNew: boolean }>;
  refreshMe: () => Promise<void>;
  resetDemo: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  loading: true,
  answers: {},
  setUser: (u) => set({ user: u }),
  setAnswer: (qid, optionIndex, stability) =>
    set((s) => ({ answers: { ...s.answers, [qid]: { optionIndex, stability } } })),
  clearAnswers: () => set({ answers: {} }),

  bootstrap: async () => {
    try {
      const { user } = await api.get<{ user: User }>("/auth/me");
      set({ user, loading: false });
      return user;
    } catch (meErr) {
      console.warn("[bootstrap] /auth/me:", String(meErr));
      // 저장된 손님 없음(새 기기/브라우저) → 이 기기 전용 손님을 새로 생성
      try {
        const r = await api.post<{ user: User; isNew: boolean }>("/auth/login", { fresh: true });
        await setUserId(r.user.id);
        set({ user: r.user, loading: false });
        return r.user;
      } catch (e) {
        console.warn("[bootstrap] login failed:", e);
        set({ loading: false });
        return null;
      }
    }
  },

  login: async (fresh = false) => {
    const r = await api.post<{ user: User; isNew: boolean }>("/auth/login", { fresh });
    await setUserId(r.user.id);
    set({ user: r.user });
    return r;
  },

  refreshMe: async () => {
    const { user } = await api.get<{ user: User }>("/auth/me");
    set({ user });
  },

  resetDemo: async () => {
    const r = await api.post<{ user: User }>("/auth/reset", {});
    set({ user: r.user, answers: {} });
  },
}));
