import { ListItem } from '@tiptap/extension-list'
import { Color, TextStyle, TextStyleKit } from '@tiptap/extension-text-style'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'

import { Editor, } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import { WebsocketProvider } from "@y-rb/actioncable";
import { createConsumer } from "@rails/actioncable";
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import * as Y from 'yjs'
import { fromBase64 } from 'lib0/buffer'

// Get memo ID and initial state from DOM
const editorElement = document.querySelector("#tiptap-editor") as HTMLElement
const memoId = editorElement?.dataset.memoId
const initialState = editorElement?.dataset.initialState || ""

if (!memoId) {
    throw new Error("Memo ID not found in editor element")
}

// Initialize Y.js document
const doc = new Y.Doc();

// Apply initial state if exists
if (initialState.length > 0) {
    const decodedState = fromBase64(initialState)
    Y.applyUpdate(doc, decodedState)
}

// Setup ActionCable consumer and provider
const consumer = createConsumer();
const provider = new WebsocketProvider(
    doc,
    consumer,
    "SyncChannel",
    { id: memoId }
);

// Get form elements
const hiddenField = document.querySelector("#memo_content") as HTMLInputElement

// Helper function for cursor colors
function getRandomColor(): string {
    const colors = ["#ff901f", "#ff2975", "#f222ff", "#8c1eff"]
    return colors[Math.floor(Math.random() * colors.length)]
}

// Initialize TipTap editor
const editor = new Editor({
    element: editorElement,
    extensions: [
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        TableKit,
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({
            document: doc,
            provider
        }),
        Placeholder.configure({ placeholder: "Enter some text..." })
        // CollaborationCaret.configure({
        //     provider,
        //     user: {
        //         name: "User",
        //     }
        // })
    ],
    onUpdate: ({ editor }) => {
        hiddenField.value = editor.getHTML()
    }
})

// Also sync on form submit to ensure we have the latest content
const form = hiddenField.closest('form')
if (form) {
    form.addEventListener('submit', () => {
        hiddenField.value = editor.getHTML()
    })
}

