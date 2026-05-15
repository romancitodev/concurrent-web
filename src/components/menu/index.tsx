import { FORKJOIN, PARBEGIN } from "@/components/editor/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { convertGraph } from "@/lib/concurrent";
import { examplesFor, type Example, type Language } from "@/lib/examples";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor";
import {
  RiArrowDownSLine,
  RiArrowLeftRightLine,
  RiCheckLine,
  RiFileCopyLine,
  RiFlaskLine,
  RiTerminalBoxLine,
} from "@remixicon/react";
import { useState } from "react";

const LANGUAGE_LABELS: Record<Language, string> = {
  [FORKJOIN]: "fork/join",
  [PARBEGIN]: "parbegin/parend",
};

export default function Menu() {
  const from = useEditorStore((s) => s.from);
  const to = useEditorStore((s) => s.to);
  const ir = useEditorStore((s) => s.ir);
  const setFrom = useEditorStore((s) => s.setFrom);
  const setTo = useEditorStore((s) => s.setTo);
  const setCode = useEditorStore((s) => s.setCode);
  const setIR = useEditorStore((s) => s.setIR);

  const [swapAngle, setSwapAngle] = useState(0);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setSwapAngle((a) => a + 180);
  };

  const loadExample = (language: Language, example: Example) => {
    const alt: Language = language === FORKJOIN ? PARBEGIN : FORKJOIN;
    setFrom(language);
    setTo(alt);
    setCode(example.code);
    try {
      setIR(convertGraph(example.code, language, "graph"));
    } catch {
      setIR("");
    }
  };

  return (
    <div className="flex w-full items-center gap-3">
      <TransformWidget from={from} to={to} angle={swapAngle} onSwap={swap} />
      <ExamplesPicker onLoad={loadExample} />
      <DotLeader />
      <IrDialog ir={ir} />
    </div>
  );
}

function TransformWidget({
  from,
  to,
  angle,
  onSwap,
}: {
  from: Language;
  to: Language;
  angle: number;
  onSwap: () => void;
}) {
  return (
    <div className="group/tx flex h-9 items-stretch border border-input bg-background/40 transition-colors hover:border-input/70">
      <LanguageCell tag="from" value={LANGUAGE_LABELS[from]} />
      <button
        type="button"
        onClick={onSwap}
        aria-label="Swap languages"
        className="relative flex w-9 items-center justify-center border-x border-input bg-foreground/2 outline-none transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary/50 active:translate-y-px"
      >
        <span
          style={{ transform: `rotate(${angle}deg)` }}
          className="inline-flex transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
        >
          <RiArrowLeftRightLine className="size-3.5 text-foreground/70 transition-colors group-hover/tx:text-primary/90" />
        </span>
      </button>
      <LanguageCell tag="to" value={LANGUAGE_LABELS[to]} />
    </div>
  );
}

function LanguageCell({ tag, value }: { tag: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3">
      <Tag>{tag}</Tag>
      <span aria-hidden className="text-muted-foreground/40">
        ·
      </span>
      <span className="font-mono text-xs tracking-tight text-foreground">
        {value}
      </span>
    </div>
  );
}

function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/65",
        className,
      )}
    >
      {children}
    </span>
  );
}

function ExamplesPicker({
  onLoad,
}: {
  onLoad: (language: Language, example: Example) => void;
}) {
  const handleSelect = (value: string) => {
    const [language, indexStr] = value.split(":");
    const lang = language as Language;
    const example = examplesFor(lang)[Number(indexStr)];
    if (example) onLoad(lang, example);
  };

  return (
    <Select value="" onValueChange={handleSelect}>
      <SelectTrigger
        className={cn(
          "group/ex h-9 gap-0 border border-input bg-background/40 px-0 py-0",
          "[&>svg]:hidden",
          "hover:border-primary/40 hover:bg-primary/4 data-[state=open]:border-primary/50",
        )}
        aria-label="Load example"
      >
        <span className="flex h-full items-center border-r border-input bg-foreground/3 px-2 transition-colors group-hover/ex:bg-primary/[0.08]">
          <RiFlaskLine className="size-3.5 text-foreground/70 transition-colors group-hover/ex:text-primary/90" />
        </span>
        <span className="flex items-center gap-2 px-3">
          <Tag>examples</Tag>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <span className="font-mono text-xs text-foreground/85">
            load preset
          </span>
          <RiArrowDownSLine className="size-4 text-muted-foreground/70 transition-transform group-data-[state=open]/ex:rotate-180" />
        </span>
      </SelectTrigger>
      <SelectContent
        className="min-w-72"
        position="popper"
        sideOffset={6}
        align="start"
      >
        <SelectGroup>
          <SelectLabel className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
            fork/join
          </SelectLabel>
          {examplesFor(FORKJOIN).map((ex, i) => (
            <ExampleItem
              key={`fk-${i}`}
              value={`${FORKJOIN}:${i}`}
              index={i}
              example={ex}
            />
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
            parbegin/parend
          </SelectLabel>
          {examplesFor(PARBEGIN).map((ex, i) => (
            <ExampleItem
              key={`par-${i}`}
              value={`${PARBEGIN}:${i}`}
              index={i}
              example={ex}
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function ExampleItem({
  value,
  index,
  example,
}: {
  value: string;
  index: number;
  example: Example;
}) {
  return (
    <SelectItem value={value} className="py-2">
      <span className="flex items-baseline gap-3">
        <span className="font-mono text-[9px] tabular-nums text-muted-foreground/50">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-xs text-foreground">
            {example.name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {example.description}
          </span>
        </span>
      </span>
    </SelectItem>
  );
}

function DotLeader() {
  return (
    <div
      aria-hidden
      className="flex flex-1 select-none items-center overflow-hidden text-muted-foreground/25"
    >
      <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.35em]">
        {".".repeat(400)}
      </span>
    </div>
  );
}

function IrDialog({ ir }: { ir: string }) {
  const [copied, setCopied] = useState(false);
  const disabled = ir.length === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ir);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "group/ir relative flex h-9 items-stretch border border-input bg-background/40 outline-none transition-colors",
            "focus-visible:ring-1 focus-visible:ring-primary/50",
            disabled
              ? "cursor-not-allowed opacity-40"
              : "hover:border-primary/50 hover:bg-primary/4 active:translate-y-px",
          )}
          aria-label="Show intermediate representation"
        >
          <span className="flex items-center border-r border-input bg-foreground/3 px-2 transition-colors group-hover/ir:bg-primary/8">
            <RiTerminalBoxLine className="size-3.5 text-foreground/70 transition-colors group-hover/ir:text-primary/90" />
          </span>
          <span className="flex items-center gap-2 px-3">
            <Tag>ir</Tag>
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
            <span className="font-mono text-xs text-foreground/85">
              {disabled ? "unavailable" : "inspect"}
            </span>
            {!disabled && (
              <span
                aria-hidden
                className="ml-1 inline-block size-1 rounded-full bg-primary/80 shadow-[0_0_6px_rgba(252,211,77,0.6)]"
              />
            )}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono normal-case">
            <Tag>ir</Tag>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm">intermediate representation</span>
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-foreground/70">
            normalized graph form emitted by the parser.
          </DialogDescription>
        </DialogHeader>
        <div className="relative border border-foreground/10">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-primary/60"
          />
          <pre className="max-h-80 overflow-auto bg-foreground/[0.03] px-4 py-3 font-mono text-[11px] leading-relaxed">
            {ir || "<empty>"}
          </pre>
          <button
            type="button"
            onClick={copy}
            disabled={disabled}
            aria-label="Copy IR to clipboard"
            className={cn(
              "absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center border border-input bg-background/80 transition-colors",
              "hover:border-primary/50 hover:text-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {copied ? (
              <RiCheckLine className="size-3.5 text-amber-300" />
            ) : (
              <RiFileCopyLine className="size-3.5" />
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
