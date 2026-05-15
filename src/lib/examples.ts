import { FORKJOIN, PARBEGIN } from "@/components/editor/core";

export type Language = typeof FORKJOIN | typeof PARBEGIN;

export type Example = {
  name: string;
  description: string;
  code: string;
};

const FK_EXAMPLES: Example[] = [
  {
    name: "Sequence",
    description: "Linear, three statements",
    code: ["begin", "    s1", "    s2", "    s3", "end"].join("\n"),
  },
  {
    name: "Parallel",
    description: "Single fork/join pair",
    code: [
      "begin",
      "    s1",
      "    fork Ls3",
      "    s2",
      "    L0: join c1",
      "    s4",
      "    Ls3: s3",
      "        goto L0",
      "end",
    ].join("\n"),
  },
  {
    name: "Complex",
    description: "Nested forks and joins",
    code: [
      "begin",
      "    s0",
      "    fork Ls3",
      "    s1",
      "    s2",
      "    L0: join c1",
      "    s6",
      "    fork Ls8",
      "    fork Ls9",
      "    s7",
      "    L2: join c3",
      "    s10",
      "    goto _end",
      "    _end: end",
      "    Ls3: s3",
      "        fork Ls5",
      "        s4",
      "    L1: join c2",
      "    goto L0",
      "    Ls5: s5",
      "        goto L1",
      "    Ls8: s8",
      "        goto L2",
      "    Ls9: s9",
      "        goto L2",
      "end",
    ].join("\n"),
  },
];

const PAR_EXAMPLES: Example[] = [
  {
    name: "Sequence",
    description: "Linear, three statements",
    code: ["begin", "    s1", "    s2", "    s3", "end"].join("\n"),
  },
  {
    name: "Parallel",
    description: "Two parallel branches",
    code: [
      "begin",
      "    s1",
      "    parbegin",
      "        s2",
      "        s3",
      "    parend",
      "    s4",
      "end",
    ].join("\n"),
  },
  {
    name: "Nested",
    description: "parbegin inside parbegin",
    code: [
      "begin",
      "    s1",
      "    parbegin",
      "        begin",
      "            s2",
      "            parbegin",
      "                s3",
      "                s4",
      "            parend",
      "            s5",
      "        end",
      "        s6",
      "    parend",
      "    s7",
      "end",
    ].join("\n"),
  },
];

export function examplesFor(language: Language): Example[] {
  return language === FORKJOIN ? FK_EXAMPLES : PAR_EXAMPLES;
}
