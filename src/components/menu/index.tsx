import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useEditorStore } from "@/store/editor";
import { Button } from "../ui/button";

export default function Menu() {
  const setFrom = useEditorStore((state) => state.setFrom);
  const setTo = useEditorStore((state) => state.setTo);
  const ir = useEditorStore((state) => state.ir);

  const handleSelect = (value: string) => {
    const alt = value === "fk" ? "par" : "fk";
    setFrom(value as "fk" | "par");
    setTo(alt);
  };

  const showIr = () => console.log(ir);

  return (
    <div className="flex w-full gap-x-2">
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full max-w-82">
          <SelectValue placeholder="fork/join to parbegin/parend" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Language</SelectLabel>
            <SelectItem value="fk">fork/join to parbegin/parend</SelectItem>
            <SelectItem value="par">parbegin/parend to fork/join</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        variant={ir ? "default" : "secondary"}
        disabled={ir.length === 0}
        onClick={showIr}
      >
        Debug IR
      </Button>
    </div>
  );
}
