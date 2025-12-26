// Import Turbo for SPA-like navigation
import "@hotwired/turbo-rails";

// Import and start Stimulus
import { Application } from "@hotwired/stimulus";

const application = Application.start();

// Configure Stimulus development experience
application.debug = false;
window.Stimulus = application;

// Import controllers
import AutosaveController from "./controllers/autosave_controller";
import TiptapEditorController from "./controllers/tiptap_editor_controller";
import KeyboardShortcutsController from "./controllers/keyboard_shortcuts_controller";
import DrawerController from "./controllers/drawer_controller";
import MemosController from "./controllers/memos_controller";

application.register("autosave", AutosaveController);
application.register("tiptap-editor", TiptapEditorController);
application.register("keyboard-shortcuts", KeyboardShortcutsController);
application.register("drawer", DrawerController);
application.register("memos-table", MemosController);

// Icon
class NotaeIcon extends HTMLElement {
    static get observedAttributes() {
        return ['size', 'stroke'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const size = this.getAttribute('size') ?? 24;
        const stroke = this.getAttribute('stroke') ?? 'currentColor';

        this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: ${size}px;
          height: ${size}px;
        }
        svg {
          width: 100%;
          height: 100%;
        }
      </style>
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24"
           fill="none"
           stroke="${stroke}"
           stroke-width="1.5"
           stroke-linecap="round"
           stroke-linejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <path d="M9 16V8"/>
        <path d="M9 8l6 8"/>
        <path d="M15 8v8"/>
      </svg>
    `;
    }
}

customElements.define('notae-icon', NotaeIcon);
