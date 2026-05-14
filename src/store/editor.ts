import { FORKJOIN, PARBEGIN } from "@/components/editor/core";
import { create } from "zustand";

type State = {
  from: typeof PARBEGIN | typeof FORKJOIN;
  to: typeof PARBEGIN | typeof FORKJOIN;
  code: string;
  ir: string;
};

type Actions = {
  setFrom: (from: State["from"]) => void;
  setTo: (to: State["to"]) => void;
  setCode(code: string): void;
  setIR(ir: string): void;
};

export const useEditorStore = create<State & Actions>((set) => ({
  from: FORKJOIN,
  to: PARBEGIN,
  code: "",
  ir: "",
  setFrom: (from) => set({ from }),
  setTo: (to) => set({ to }),
  setCode: (code) => set({ code }),
  setIR: (ir) => set({ ir }),
}));
