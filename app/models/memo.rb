class Memo < ApplicationRecord
  # Owner relationship
  belongs_to :owner, class_name: "Account", foreign_key: "account_id"

  # Editors relationship (many-to-many)
  has_many :memo_editors, dependent: :destroy
  has_many :editors, through: :memo_editors, source: :account

  # Invitations
  has_many :memo_invitations, dependent: :destroy

  # Team invitation (for 1-on-1 memos)
  has_one :team_invitation, dependent: :nullify

  # Memo types
  enum :memo_type, {
    shared: "shared",                    # Default collaborative memos
    team_one_on_one: "team_one_on_one"   # Special 1-on-1 memos between owner/member
  }

  # Scopes
  scope :shared, -> { where(memo_type: "shared") }
  scope :team_one_on_one, -> { where(memo_type: "team_one_on_one") }
end
