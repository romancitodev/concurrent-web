import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";
import init, {
  render_graph_to_svg_wasm,
  convert_graph_string_wasm,
} from "concurrent";

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (moduleId: string, label: string) => Worker;
    };
  }
}

const initPromise = init();

if (!window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker: () =>
      new Worker(
        new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url),
        { type: "module" },
      ),
  };
}

const samples = [
  {
    id: "fork-join",
    label: "fork/join -> parbegin/parend",
    value: `begin
        s1
        fork Ls3
        s2
        L0: join c1
        s4
        Ls3: s3
            goto L0
    end`,
  },
  {
    id: "parbegin-parend",
    label: "parbegin/parend -> fork/join",
    value: `begin
      s0
      parbegin
        begin
          s1
          s2
        end
        begin
          s3
          parbegin
            s4
            s5
          parend
        end
      parend
      s6
      parbegin
        s7
        s8
        s9
      parend
      s10
    end`,
  },
];

function App() {
  const [input, setInput] = useState(samples[0].value);
  const [sampleId, setSampleId] = useState(samples[0].id);
  const [wasmError, setWasmError] = useState<string | null>(null);
  const [wasmReady, setWasmReady] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [conversionCopied, setConversionCopied] = useState(false);

  useEffect(() => {
    let active = true;

    initPromise
      .then(() => {
        if (!active) return;
        setWasmReady(true);
      })
      .catch((error) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : String(error);
        setWasmError(message);
      });

    return () => {
      active = false;
    };
  }, []);

  const getFromKind = () => (sampleId === "fork-join" ? "fk" : "par");

  const { svg, renderError, isLoading, graphInput } = useMemo(() => {
    if (wasmError) {
      return {
        svg: "",
        renderError: wasmError,
        isLoading: false,
        graphInput: "",
      };
    }

    if (!wasmReady) {
      return {
        svg: "",
        renderError: null,
        isLoading: true,
        graphInput: "",
      };
    }

    try {
      const graph = convert_graph_string_wasm(input, getFromKind(), "graph");

      return {
        svg: render_graph_to_svg_wasm(graph, "graph"),
        renderError: null,
        isLoading: false,
        graphInput: graph,
      };
    } catch (error) {
      return {
        svg: "",
        renderError: error instanceof Error ? error.message : String(error),
        isLoading: false,
        graphInput: "",
      };
    }
  }, [input, wasmError, wasmReady, sampleId]);

  const { conversionOutput, conversionError, conversionLoading } =
    useMemo(() => {
      if (wasmError) {
        return {
          conversionOutput: "",
          conversionError: wasmError,
          conversionLoading: false,
        };
      }

      if (!wasmReady) {
        return {
          conversionOutput: "",
          conversionError: null,
          conversionLoading: true,
        };
      }

      try {
        const toKind = sampleId === "fork-join" ? "par" : "fk";
        const output = convert_graph_string_wasm(input, getFromKind(), toKind);

        return {
          conversionOutput: output,
          conversionError: null,
          conversionLoading: false,
        };
      } catch (error) {
        return {
          conversionOutput: "",
          conversionError:
            error instanceof Error ? error.message : String(error),
          conversionLoading: false,
        };
      }
    }, [input, wasmError, wasmReady, sampleId]);

  const handleSampleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value;
    const sample = samples.find((item) => item.id === nextId);
    if (!sample) return;
    setSampleId(nextId);
    setInput(sample.value);
  };

  const handleConvert = () => {
    if (!wasmReady || conversionError) return;

    const nextSampleId =
      sampleId === "fork-join" ? "parbegin-parend" : "fork-join";

    setInput(conversionOutput);
    setSampleId(nextSampleId);
  };

  const handleCopyConversion = async () => {
    if (!conversionOutput) return;

    try {
      await navigator.clipboard.writeText(conversionOutput);
      setConversionCopied(true);
      window.setTimeout(() => setConversionCopied(false), 1500);
    } catch {
      setConversionCopied(false);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="toolbar">
          <select
            className="toolbar-select"
            value={sampleId}
            onChange={handleSampleChange}
          >
            {samples.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.label}
              </option>
            ))}
          </select>

          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-button"
              onClick={handleConvert}
              disabled={!wasmReady || conversionLoading || !!conversionError}
            >
              Convert
            </button>
            <button type="button" className="toolbar-button" disabled>
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="panel editor-panel">
          <div className="panel-header">Editor</div>
          <div className="editor">
            <div className="editor-container">
              <Editor
                theme="vs-dark"
                defaultLanguage="plaintext"
                value={input}
                height="100%"
                width="100%"
                onChange={(value) => {
                  setInput(value ?? "");
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 22,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
          {renderError ? (
            <div className="error-panel">
              <div className="error-title">Error</div>
              <div className="error-message">{renderError}</div>
            </div>
          ) : null}
          <div className="conversion-panel">
            <div className="conversion-header conversion-header-row">
              <span>Conversion</span>
              <button
                type="button"
                className="panel-button"
                onClick={handleCopyConversion}
                disabled={
                  conversionLoading || !!conversionError || !conversionOutput
                }
              >
                {conversionCopied ? "Copied" : "Copy"}
              </button>
            </div>
            {conversionLoading ? (
              <div className="conversion-loading">Loading converter…</div>
            ) : conversionError ? (
              <div className="conversion-error">{conversionError}</div>
            ) : (
              <div className="conversion-editor">
                <Editor
                  theme="vs-dark"
                  defaultLanguage="plaintext"
                  value={conversionOutput}
                  height="100%"
                  width="100%"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineHeight: 20,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 12, bottom: 12 },
                    readOnly: true,
                    domReadOnly: true,
                  }}
                />
              </div>
            )}
          </div>
        </section>

        <section className="panel preview-panel">
          <div className="panel-header panel-header-row">
            <span>Preview</span>
            <div className="panel-actions">
              <button
                type="button"
                className="panel-button"
                onClick={() =>
                  setPreviewTheme((prev) =>
                    prev === "dark" ? "light" : "dark",
                  )
                }
              >
                {previewTheme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                type="button"
                className="panel-button"
                onClick={() =>
                  setPreviewScale((prev) => Math.min(prev * 1.2, 4))
                }
              >
                +
              </button>
              <button
                type="button"
                className="panel-button"
                onClick={() =>
                  setPreviewScale((prev) => Math.max(prev / 1.2, 0.2))
                }
              >
                −
              </button>
              <button
                type="button"
                className="panel-button"
                onClick={() => {
                  setPreviewScale(1);
                  setPreviewOffset({ x: 0, y: 0 });
                }}
              >
                Reset
              </button>
            </div>
          </div>
          <div
            className={`preview-body ${previewTheme} ${isPanning ? "panning" : ""}`}
            onWheel={(event) => {
              event.preventDefault();
              const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
              setPreviewScale((prev) =>
                Math.min(Math.max(prev * zoomFactor, 0.2), 4),
              );
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              setIsPanning(true);
              setPanStart({ x: event.clientX, y: event.clientY });
              setOffsetStart(previewOffset);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!isPanning) return;
              const dx = event.clientX - panStart.x;
              const dy = event.clientY - panStart.y;
              setPreviewOffset({
                x: offsetStart.x + dx,
                y: offsetStart.y + dy,
              });
            }}
            onPointerUp={(event) => {
              setIsPanning(false);
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerLeave={() => setIsPanning(false)}
          >
            {renderError ? (
              <div className="preview-error">
                Fix the error to see a preview.
              </div>
            ) : isLoading ? (
              <div className="preview-error">Loading renderer…</div>
            ) : (
              <div
                className="preview-canvas"
                style={{
                  transform: `translate(${previewOffset.x}px, ${previewOffset.y}px) scale(${previewScale})`,
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
          <div className="irt-panel">
            <div className="irt-header">IRT</div>
            {renderError ? (
              <div className="irt-error">{renderError}</div>
            ) : (
              <pre className="irt-output">{graphInput}</pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
