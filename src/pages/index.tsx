import { Playground } from "@/components/editor/playground";
import { Preview } from "@/components/editor/preview";
import { Renderer } from "@/components/editor/renderer";
import Menu from "@/components/menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import init from "concurrent";

await init();

export default function Index() {
  return (
    <div className="w-full min-h-screen flex flex-col gap-4 p-4">
      <Menu />
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full flex-1 min-h-0"
      >
        <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
          <ResizablePanelGroup
            orientation="vertical"
            className="h-full min-h-0"
          >
            <ResizablePanel defaultSize={50} minSize={20} className="min-h-0">
              <Playground />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={20} className="min-h-0">
              <Preview />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
          <Renderer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
