import { Controller } from "@hotwired/stimulus";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { ListItem } from "@tiptap/extension-list";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import Collaboration from "@tiptap/extension-collaboration";
import { WebsocketProvider } from "@y-rb/actioncable";
import { createConsumer } from "@rails/actioncable";
import * as Y from "yjs";
import { fromBase64 } from "lib0/buffer";
import { MarkdownExtension } from "./markdown_extension";
import { Markdown } from "@tiptap/markdown";
import { Mark } from "@tiptap/pm/model";

export default class extends Controller {
  static values = {
    memoId: String,
    initialState: String,
    url: String,
  };

  declare readonly memoIdValue: string;
  declare readonly initialStateValue: string;
  declare readonly urlValue: string;

  private editor: Editor | null = null;
  private provider: WebsocketProvider | null = null;
  private doc: Y.Doc | null = null;

  connect() {
    // Initialize Y.js document
    this.doc = new Y.Doc();

    // Apply initial state if exists
    if (this.initialStateValue && this.initialStateValue.length > 0) {
      const decodedState = fromBase64(this.initialStateValue);
      Y.applyUpdate(this.doc, decodedState);
    }

    // Setup ActionCable consumer and provider
    const consumer = createConsumer();
    this.provider = new WebsocketProvider(this.doc, consumer, "SyncChannel", {
      id: this.memoIdValue,
    });

    // Initialize TipTap editor
    this.editor = new Editor({
      element: this.element as HTMLElement,
      extensions: [
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        Markdown,
        TableKit,
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({
          document: this.doc,
        }),
        Placeholder.configure({ placeholder: "Enter some text..." }),
        MarkdownExtension,
      ],
      onUpdate: ({ editor }) => {
        this.save(editor.getHTML());
      },
    });
  }

  disconnect() {
    // Cleanup
    this.editor?.destroy();
    this.provider?.destroy();
    this.doc?.destroy();

    this.editor = null;
    this.provider = null;
    this.doc = null;
  }

  private save(content: string) {
    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": this.csrfToken(),
      },
      body: JSON.stringify({
        memo: {
          content,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        // console.log("Content saved successfully");
      })
      .catch((error) => {
        console.error("Save failed:", error);
      });
  }

  private csrfToken(): string {
    const meta = document.querySelector(
      'meta[name="csrf-token"]',
    ) as HTMLMetaElement;
    return meta?.content || "";
  }
}
