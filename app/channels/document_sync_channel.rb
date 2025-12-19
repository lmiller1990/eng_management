class DocumentSyncChannel < ApplicationCable::Channel
  include Y::Actioncable::Sync

  def subscribed
    # document_id should be passed from the client (e.g., memo_123)
    reject unless params[:document_id].present?

    sync_for(params[:document_id])
  end

  def receive(message)
    sync_to(params[:document_id], message)
  end
end
