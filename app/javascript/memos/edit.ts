import { ListItem } from '@tiptap/extension-list'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import { WebsocketProvider } from "@y-rb/actioncable";
import { createConsumer } from "@rails/actioncable";
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'

const existingContent = `
<h2>
Hi there,
</h2>
<p>
this is a
<em>basic</em>
example of
<strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect
from a text editor. But wait until you see the lists:
</p>
<ul>
<li>
  That's a bullet list with one …
</li>
<li>
  … or two list items.
</li>
</ul>
<p>
Isn't that great? And all of that is editable. But wait, there's more.
Let's try a code block:
</p>
<pre><code class="language-css">body { display: none; }</code></pre>
<p>
I know, I know, this is impressive. It's only the tip of the iceberg
though. Give it a try and click a little bit around. Don't forget to
check the other examples too.
</p>
<blockquote>
Wow, that's amazing. Good work, boy! 👏
<br/>
— Mom
</blockquote>
`


const doc = new Y.Doc();
const consumer = createConsumer();


const provider = new WebsocketProvider(
    doc,
    consumer,
    "SyncChannel",
    { id: "1" }
);

const hiddenField = document.querySelector("#memo_content")
const editorElement = document.querySelector("#tiptap-editor")

const editor = new Editor({
    element: editorElement,
    extensions: [
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        TextStyle.configure({ types: [ListItem.name] }),
        StarterKit,
        Collaboration.configure({
            document: provider.doc, // Configure Y.Doc for collaboration
            provider
        }),
        // CollaborationCursor.configure({
        // provider,
        // user: { name: "Hannes", color: "#ff0000" }
        // })
    ],
    content: existingContent,
    onUpdate: ({ editor }) => {
        // Sync content back to hidden field whenever it changes
        hiddenField.value = editor.getHTML()
    }
})

// Also sync on form submit to ensure we have the latest content
const form = hiddenField.closest('form')
form.addEventListener('submit', () => {
    hiddenField.value = editor.getHTML()
})


