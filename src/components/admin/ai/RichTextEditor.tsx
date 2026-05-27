"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Extension } from "@tiptap/react";
import { useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Minus,
  Plus,
  Palette,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const FONT_SIZES = [
  { label: "Petit", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Moyen", value: "16px" },
  { label: "Grand", value: "18px" },
  { label: "Très grand", value: "22px" },
  { label: "Titre", value: "28px" },
];

const COLORS = [
  "#1A1A1A",
  "#4A4A4A",
  "#6B6B6B",
  "#F5A623",
  "#E09010",
  "#2563EB",
  "#059669",
  "#DC2626",
  "#7C3AED",
  "#DB2777",
];

interface RichTextEditorProps {
  content: string;
  onChange?: (html: string) => void;
  label: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarButton({ onClick, isActive, title, children, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        isActive
          ? "bg-[#F5A623]/20 text-[#F5A623]"
          : "text-[#6B6B6B] hover:bg-[#F0F0F0] hover:text-[#1A1A1A]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-[#E5E5E5] mx-1" />;
}

export default function RichTextEditor({
  content,
  onChange,
  label,
  minHeight = "120px",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
      }),
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: plainTextToHtml(content),
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
        style: `min-height: ${minHeight}; padding: 12px; font-size: 14px; line-height: 1.7; color: #4A4A4A;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentText = editor.getText();
      if (currentText !== content && !editor.isFocused) {
        editor.commands.setContent(plainTextToHtml(content));
      }
    }
  }, [content, editor]);

  const changeFontSize = useCallback(
    (direction: "up" | "down") => {
      if (!editor) return;
      const currentAttrs = editor.getAttributes("textStyle");
      const currentSize = currentAttrs.fontSize
        ? parseInt(currentAttrs.fontSize)
        : 14;
      const idx = FONT_SIZES.findIndex(
        (s) => parseInt(s.value) === currentSize
      );

      let newIdx: number;
      if (direction === "up") {
        newIdx = idx < FONT_SIZES.length - 1 ? idx + 1 : idx;
      } else {
        newIdx = idx > 0 ? idx - 1 : 0;
      }

      editor.chain().focus().setMark("textStyle", { fontSize: FONT_SIZES[newIdx].value }).run();
    },
    [editor]
  );

  if (!editor) return null;

  const currentFontSize = editor.getAttributes("textStyle").fontSize || "14px";
  const currentSizeLabel =
    FONT_SIZES.find((s) => s.value === currentFontSize)?.label || "Normal";

  return (
    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <span className="text-xs font-semibold text-[#1A1A1A]">{label}</span>
      </div>

      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-[#E5E5E5] bg-white">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Gras"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italique"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Souligné"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => changeFontSize("down")}
          title="Réduire la taille"
        >
          <Minus size={14} />
        </ToolbarButton>
        <span className="px-2 text-[11px] text-[#6B6B6B] font-medium min-w-[60px] text-center select-none flex items-center gap-1">
          <Type size={12} />
          {currentSizeLabel}
        </span>
        <ToolbarButton
          onClick={() => changeFontSize("up")}
          title="Augmenter la taille"
        >
          <Plus size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Aligner à gauche"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Centrer"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Aligner à droite"
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="Couleur du texte">
            <Palette size={15} />
          </ToolbarButton>
          <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg border border-[#E5E5E5] shadow-lg hidden group-hover:grid grid-cols-5 gap-1.5 z-50 min-w-[140px]">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="w-5 h-5 rounded-full border border-[#E5E5E5] hover:scale-125 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="col-span-5 text-[10px] text-[#6B6B6B] hover:text-[#1A1A1A] py-0.5"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
        >
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir"
        >
          <Redo2 size={15} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function plainTextToHtml(text: string): string {
  if (!text) return "<p></p>";
  if (text.startsWith("<")) return text;

  return text
    .split(/\n\n+/)
    .map((paragraph) => {
      const lines = paragraph.split(/\n/).join("<br/>");
      return `<p>${lines}</p>`;
    })
    .join("");
}
