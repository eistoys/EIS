import { Header } from "@/components/Header";

export default function CreatePage() {
  return (
    <div className="flex flex-col flex-grow">
      <iframe
        id="svg-editor-iframe"
        src="/editor/index.html"
        className="flex-grow"
        style={{ border: "none" }}
      />
      <div>Create</div>
    </div>
  );
}
