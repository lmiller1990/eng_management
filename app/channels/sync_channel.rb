class SyncChannel < ApplicationCable::Channel
  include Y::Actioncable::Sync

  def subscribed
    # initiate sync & subscribe to updates, with optional persistence mechanism
    sync_for(session) { |id, update| save_doc(id, update) }
  end

  def receive(message)
    # broadcast update to all connected clients on all servers
    sync_to(session, message)
  end

  def doc
    @doc ||= load { |id| load_doc(id) }
  end

  private

  def session
    @session ||= Session.new(params[:id])
  end

  def load_doc(id)
    memo = Memo.find_by(id: params[:id])
    return nil if memo.nil? || memo.yjs_state.nil?

    memo.yjs_state.unpack("C*")
  end

  def save_doc(id, state)
    memo = Memo.find_by(id: params[:id])
    return if memo.nil?

    memo.update_column(:yjs_state, state.pack("C*"))
  end
end
