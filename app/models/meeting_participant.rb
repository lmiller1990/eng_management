class MeetingParticipant < ApplicationRecord
  belongs_to :meeting
  belongs_to :account

  validates :account_id, uniqueness: {
    scope: :meeting_id,
    message: "is already a participant in this meeting"
  }
end
