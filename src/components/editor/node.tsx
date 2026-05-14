// Define the shape of your node data if using TypeScript
interface SvgNodeData {
  svg: string;
}

export function Node({ data }: { data: SvgNodeData }) {
  console.log(data);
  return (
    <div
      style={{
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      dangerouslySetInnerHTML={{ __html: data.svg }}
    />
  );
}
