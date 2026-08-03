import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

/**
 * Toolbar-driven Markdown editor (headings, bold, links, lists, images).
 *
 * Markdown rather than HTML on purpose: the API applies xss-clean to every
 * request body, which HTML-escapes any markup it finds — so an HTML-producing
 * editor (TipTap/Quill) would have its tags mangled into literal text on save.
 * Markdown passes through that middleware untouched, and storing markup-free
 * text means there is no raw HTML to sanitize when rendering either.
 */
const RichTextEditor = ({ value, onChange, height = 320, placeholder }) => (
  <div data-color-mode="light" className="mt-1">
    <MDEditor
      value={value || ""}
      onChange={(val) => onChange(val || "")}
      height={height}
      preview="edit"
      textareaProps={{ placeholder }}
    />
  </div>
);

export default RichTextEditor;
