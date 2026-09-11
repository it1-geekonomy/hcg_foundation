"use client";

import { Editor } from "@tinymce/tinymce-react";

type CmsRichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
};

/**
 * TinyMCE rich text editor for CMS content fields (GPL / self-hosted CDN).
 */
export default function CmsRichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write content…",
  height = 360,
}: CmsRichTextEditorProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-input bg-white [&_.tox-tinymce]:!rounded-lg [&_.tox-tinymce]:!border-0">
      <Editor
        id={id}
        licenseKey="gpl"
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@8/tinymce.min.js"
        value={value}
        onEditorChange={(content) => {
          if (content === value) return;
          onChange(content);
        }}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          statusbar: true,
          resize: true,
          placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline strikethrough | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | link image media table | " +
            "removeformat code fullscreen | help",
          content_style:
            "body { font-family: Manrope, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #212121; }" +
            " body * { color: #212121 !important; }" +
            " a { color: #9A7B00 !important; }",
          skin: "oxide",
          content_css: "default",
        }}
      />
    </div>
  );
}
