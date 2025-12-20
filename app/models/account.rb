class Account < ApplicationRecord
  include Rodauth::Rails.model
  enum :status, { unverified: 1, verified: 2, closed: 3 }

  has_many :meeting_participants, dependent: :destroy
  has_many :meetings, through: :meeting_participants
  has_many :notes, dependent: :destroy
  has_many :action_items, dependent: :destroy

  # Memo relationships
  has_many :owned_memos, class_name: 'Memo', foreign_key: 'account_id', dependent: :destroy
  has_many :memo_editors, dependent: :destroy
  has_many :editable_memos, through: :memo_editors, source: :memo

  # Team relationships
  has_many :team_memberships, dependent: :destroy
  has_many :teams, through: :team_memberships
  has_many :owned_teams, class_name: "Team", foreign_key: "owner_id", dependent: :destroy
  has_many :sent_team_invitations, class_name: "TeamInvitation", foreign_key: "inviter_id", dependent: :nullify

  # Memo invitation relationships
  has_many :sent_memo_invitations, class_name: "MemoInvitation", foreign_key: "inviter_id", dependent: :nullify

  # Check for pending invitations after account creation
  after_create :accept_pending_invitations

  private

  def accept_pending_invitations
    # Only auto-accept invitations if the account has a password set
    # This prevents auto-accepting for accounts created via invitation workflow
    return unless password_hash.present?

    # Accept team invitations
    TeamInvitation.pending.where(email: email).find_each do |invitation|
      invitation.accept!(self)
    end

    # Accept memo invitations
    MemoInvitation.pending.where(email: email).find_each do |invitation|
      invitation.accept!(self)
    end
  end
end
