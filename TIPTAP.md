# Collaboration extension

This small guide quickly shows how to integrate basic collaboration functionality into your editor. For a proper collaboration integration, review the documentation of [Tiptap Collaboration](/docs/collaboration/getting-started/overview), which is a cloud and on-premises collaboration server solution.

## [](#install)Install

### More details

For more detailed information on how to integrate, install, and configure the Collaboration extension with the Tiptap Collaboration product, please visit our [feature page](/docs/collaboration/getting-started/overview).

```
npm install @tiptap/extension-collaboration @tiptap/y-tiptap yjs y-websocket
```

## [](#settings)Settings

### [](#document)document

An initialized Y.js document.

Default: `null`

```
Collaboration.configure({
  document: new Y.Doc(),
})
```

### [](#field)field

Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.

Default: `'default'`

```
Collaboration.configure({
  document: new Y.Doc(),
  field: 'title',
})
```

### [](#fragment)fragment

A raw Y.js fragment, can be used instead of `document` and `field`.

Default: `null`

```
Collaboration.configure({
  fragment: new Y.Doc().getXmlFragment('body'),
})
```

## [](#commands)Commands

The `Collaboration` extension comes with its own history extension. Make sure to disable the `UndoRedo` extension, if you’re working with the `StarterKit`.

### [](#undo)undo()

Undo the last change.

```
editor.commands.undo()
```

### [](#redo)redo()

Redo the last change.

```
editor.commands.redo()
```

## [](#keyboard-shortcuts)Keyboard shortcuts

Command

Windows/Linux

macOS

undo()

Control + Z

Cmd + Z

redo()

Shift + Control + Z or Control + Y

Shift + Cmd + Z or Cmd + Y

## [](#source-code)Source code

[packages/extension-collaboration/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration/)

## [](#you-did-it)You Did It!

Your editor is now collaborative! Invite your friends and start typing together 🙌🏻 If you want to continue building out your collaborative editing features, make sure to check out the [Tiptap Collaboration Docs](/docs/collaboration/getting-started/overview) for a fully hosted on on-premises collaboration server solution.

## Collaboration

Fasten your seatbelts! Make your rich text editor collaborative with Tiptap Collaboration.

-   Real-time everything
-   Offline-first & conflict free
-   Managed and hosted by us or on your premises

[

Learn more

](/docs/collaboration/getting-started/overview)
