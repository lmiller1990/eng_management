// Import Turbo for SPA-like navigation
import "@hotwired/turbo-rails"

// Import and start Stimulus
import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus = application

// Import controllers
import AutosaveController from "./controllers/autosave_controller"
import TiptapEditorController from "./controllers/tiptap_editor_controller"
import KeyboardShortcutsController from "./controllers/keyboard_shortcuts_controller"
import DrawerController from "./controllers/drawer_controller"
import MemosController from "./controllers/memos_controller"

application.register("autosave", AutosaveController)
application.register("tiptap-editor", TiptapEditorController)
application.register("keyboard-shortcuts", KeyboardShortcutsController)
application.register("drawer", DrawerController)
application.register("memos-table", MemosController)
