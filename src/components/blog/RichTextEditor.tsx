import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadBlogImage } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  userId: string;
}

export function RichTextEditor({ value, onChange, userId }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg border border-border" } }),
      Placeholder.configure({ placeholder: "Write the article…" }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[420px] w-full px-5 py-4 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return <div className="min-h-[420px] rounded-xl border border-border bg-card" aria-busy="true" />;
  }

  async function handleImage(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be smaller than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadBlogImage(file, userId);
      editor!.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const tool = (active: boolean) =>
    cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
      active && "border-border bg-surface text-foreground",
    );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
        <button type="button" aria-label="Bold" className={tool(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Italic" className={tool(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Heading 2"
          className={tool(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Heading 3"
          className={tool(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Bullet list" className={tool(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          className={tool(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Quote" className={tool(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Code block" className={tool(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Add link"
          className={tool(editor.isActive("link"))}
          onClick={() => {
            const previous = editor.getAttributes("link")["href"] as string | undefined;
            const url = window.prompt("Link URL", previous ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button type="button" size="sm" variant="ghost" disabled={uploading} onClick={() => fileInput.current?.click()}>
          <ImagePlus className="mr-1.5 h-4 w-4" />
          {uploading ? "Uploading…" : "Image"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleImage(file);
          }}
        />
        <span className="ml-auto flex gap-1">
          <button type="button" aria-label="Undo" className={tool(false)} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Redo" className={tool(false)} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </button>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
