class Meeting < ApplicationRecord
  has_many :meeting_participants, dependent: :destroy
  has_many :accounts, through: :meeting_participants
  has_many :notes, dependent: :destroy
  has_many :action_items, dependent: :destroy
end
