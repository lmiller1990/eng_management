import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

// https://tiptap.dev/docs/editor/markdown/examples#paste-markdown-detection

function looksLikeMarkdown(text: string): boolean {
  // Simple heuristic: check for Markdown syntax
  return (
    /^#{1,6}\s/.test(text) || // Headings
    /\*\*[^*]+\*\*/.test(text) || // Bold
    /\[.+\]\(.+\)/.test(text) || // Links
    /^[-*+]\s/.test(text)
  ); // Lists
}

export const MarkdownExtension = Extension.create({
  name: "eventHandler",

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handlePaste(view, event, slice) {
            const text = event.clipboardData?.getData("text/plain");

            if (!text) {
              return false;
            }

            // Check if text looks like Markdown
            if (looksLikeMarkdown(text)) {
              const { state, dispatch } = view;
              // Parse the Markdown text to Tiptap JSON using the Markdown manager
              let json = editor.markdown?.parse(text);
              if (!json) {
                console.error(
                  "Could not parse markdown. Default to pasting as-is",
                );
                return;
              }

              // Insert the parsed JSON content at cursor position
              editor.commands.insertContent(json);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});
