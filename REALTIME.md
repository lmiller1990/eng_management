Real-time Collaboration Implementation

Approach: yrb + Action Cable (all-in-Rails, no Node.js)

Stack:
- yrb-actioncable gem (Ruby bindings for Y.js CRDT)
- Action Cable for WebSocket transport
- TipTap Collaboration extension on frontend
- Solid Cable for production

Implementation:

1. Backend
   - app/channels/application_cable/ - Base Action Cable classes with authentication
   - app/channels/document_sync_channel.rb - Syncs Y.js documents via Action Cable
   - Documents identified by memo_id (e.g., "memo_123")

2. Frontend (app/views/memos/_form.html.erb)
   - Uses importmap for all JS dependencies (no CDN)
   - Y.js document synced via ActioncableProvider
   - TipTap editor with Collaboration extension
   - StarterKit history disabled (Y.js handles undo/redo)

3. Dependencies pinned via importmap:
   - yjs, @y-rb/actioncable, @rails/actioncable
   - @tiptap/extension-collaboration
   - @tiptap/starter-kit and other TipTap extensions

Testing:
Open same memo in multiple browser windows to see real-time sync.

Future enhancements:
- Persistence layer to save Y.js updates to database
- Awareness protocol for cursor tracking
- User presence indicators

Notes:
- yrb-actioncable is pre-1.0, API may change
- Each document isolated by document_id
- Authentication via Warden in ApplicationCable::Connection

References:
https://github.com/y-crdt/yrb
https://github.com/y-crdt/yrb-actioncable
https://y-crdt.github.io/yrb-actioncable/
https://tiptap.dev/docs/collaboration




