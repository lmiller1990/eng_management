json.extract! meeting_participant, :id, :meeting_id, :account_id, :created_at, :updated_at
json.url meeting_participant_url(meeting_participant, format: :json)
