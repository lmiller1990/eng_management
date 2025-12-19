class AddUniquenessIndexToMeetingParticipants < ActiveRecord::Migration[8.1]
  def change
    add_index :meeting_participants, [:meeting_id, :account_id], unique: true
  end
end
