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
import { IndexeddbPersistence } from "y-indexeddb";
import { fromBase64 } from "lib0/buffer";
import { MarkdownExtension } from "./markdown_extension";
import { Markdown } from "@tiptap/markdown";
import ToastController from "./toast_controller";
import { csrfToken } from "../utils/csrf";

export default class extends Controller {
  static outlets = ["toast"];

  declare readonly toastOutlet: ToastController;

  static values = {
    memoId: String,
    initialState: String,
  };

  declare readonly memoIdValue: string;
  declare readonly initialStateValue: string;

  #editor?: Editor;
  #provider?: WebsocketProvider;
  doc = new Y.Doc();

  get editor() {
    if (this.#editor) {
      throw new Error(`#editor is not init. It should be init in connect()`);
    }
    return this.#editor;
  }

  get provider() {
    if (!this.#provider) {
      throw new Error(`#provider is not init. It should be init in connect()`);
    }
    return this.#provider;
  }

  heartbeatInterval?: number;
  syncMetadata: {
    online: boolean;
    lastHeartbeatTime: string;
  } = {
    online: false,
    lastHeartbeatTime: new Date().toLocaleTimeString(),
  };

  get onlineMsg() {
    return this.syncMetadata.online
      ? "Online"
      : "Offline. Changes will be persisted when reconnected";
  }

  initHeartbeat() {
    this.heartbeatInterval = window.setInterval(async () => {
      this.syncMetadata.online = this.provider.synced;
      try {
        const res = await fetch(`/heartbeat/ping`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-Token": csrfToken(),
          },
        });
        const json = (await res.json()) as { timestamp: string };
        this.syncMetadata.lastHeartbeatTime = new Date(
          json.timestamp,
        ).toLocaleTimeString();
        this.toastOutlet.show(
          `${this.onlineMsg}.<br> Last heartbeat: ${this.syncMetadata.lastHeartbeatTime}`,
        );
      } catch (e) {
        console.error(e);
        this.syncMetadata.online = false;
        this.toastOutlet.show(
          `${this.onlineMsg}.<br> Last heartbeat: ${this.syncMetadata.lastHeartbeatTime}`,
        );
      }
    }, 5000);
  }

  connect() {
    // Initialize Y.js document
    new IndexeddbPersistence(`memo-${this.memoIdValue}`, this.doc);

    this.initHeartbeat();

    // Apply initial state if exists
    if (this.initialStateValue && this.initialStateValue.length > 0) {
      const decodedState = fromBase64(this.initialStateValue);
      Y.applyUpdate(this.doc, decodedState);
    }

    // Setup ActionCable consumer and provider
    const consumer = createConsumer();
    this.#provider = new WebsocketProvider(this.doc, consumer, "SyncChannel", {
      id: this.memoIdValue,
    });

    // Initialize TipTap editor
    this.#editor = new Editor({
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
    });
  }

  disconnect() {
    this.provider?.destroy();
    this.#editor?.destroy();
    window.clearInterval(this.heartbeatInterval);
  }
}
