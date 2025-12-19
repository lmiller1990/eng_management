json.extract! note, :id, :meeting_id, :account_id, :content, :created_at, :updated_at
json.url note_url(note, format: :json)
