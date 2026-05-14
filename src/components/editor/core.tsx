import { Editor, type EditorProps } from "@monaco-editor/react";

type Props = Omit<EditorProps, "beforeMount" | "theme">;

export default function Component(props: Props) {
  const mergedConfig = props.options ? { ...config, ...props.options } : config;
  return (
    <Editor
      height="100%"
      theme="concurrent"
      options={mergedConfig}
      beforeMount={initMonaco}
      {...props}
    />
  );
}

const config: EditorProps["options"] = {
  fontSize: 12,
  fontFamily: "JetBrains Mono, monospace",
  fontLigatures: true,
  wordWrap: "on",
  minimap: { enabled: false },
  bracketPairColorization: { enabled: false },
  theme: "concurrent",
};

type Monaco = typeof import("monaco-editor");

export const PARBEGIN = "par";
export const FORKJOIN = "fk";

function initMonaco(monaco: Monaco) {
  monaco.languages.register({ id: PARBEGIN });
  monaco.languages.setMonarchTokensProvider(PARBEGIN, {
    keywords: ["parbegin", "parend", "begin", "end"],
    tokenizer: {
      root: [
        [/[ \t\r\n]+/, "white"],
        [/\b(parbegin|parend|begin|end)\b/, "keyword"],
        [/\bs\d+\b/, "identifier"],
        [/[a-zA-Z_][a-zA-Z0-9_]*/, "type.identifier"],
        [/\d+/, "number"],
        [/\/\/.*$/, "comment"],
      ],
    },
  });
  monaco.languages.setLanguageConfiguration(PARBEGIN, {
    brackets: [
      ["begin", "end"],
      ["parbegin", "parend"],
    ],
    indentationRules: {
      increaseIndentPattern: /^\s*(begin|parbegin)\b.*$/,
      decreaseIndentPattern: /^\s*(end|parend)\b.*$/,
    },
  });

  monaco.languages.register({ id: FORKJOIN });
  monaco.languages.setMonarchTokensProvider(FORKJOIN, {
    keywords: ["begin", "end", "fork", "join", "goto"],
    tokenizer: {
      root: [
        [/[ \t\r\n]+/, "white"],
        [/\b(begin|end|fork|join|goto)\b/, "keyword"],
        [/[_A-Za-z][A-Za-z0-9_]*(?=\s*:)/, "tag"],
        [/:/, "delimiter"],
        [/\bc\d+\b/, "variable"],
        [/\bs\d+\b/, "identifier"],
        [/[_a-zA-Z][a-zA-Z0-9_]*/, "type.identifier"],
        [/\d+/, "number"],
        [/\/\/.*$/, "comment"],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration(FORKJOIN, {
    brackets: [["begin", "end"]],
    indentationRules: {
      increaseIndentPattern: /^\s*begin\b/,
      decreaseIndentPattern: /^\s*end\b/,
    },
  });

  monaco.editor.defineTheme("concurrent", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
      { token: "tag", foreground: "DCDCAA" },
      { token: "delimiter", foreground: "D4D4D4" },
      { token: "variable", foreground: "4FC1FF" },
      { token: "identifier", foreground: "9CDCFE" },
      { token: "type.identifier", foreground: "CE9178" },
      { token: "number", foreground: "B5CEA8" },
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },
    ],
    colors: {},
  });
}
