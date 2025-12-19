class Account < ApplicationRecord
  include Rodauth::Rails.model
  enum :status, { unverified: 1, verified: 2, closed: 3 }

  has_many :meeting_participants, dependent: :destroy
  has_many :meetings, through: :meeting_participants
  has_many :notes, dependent: :destroy
  has_many :action_items, dependent: :destroy

  # Team relationships
  has_many :team_memberships, dependent: :destroy
  has_many :teams, through: :team_memberships
  has_many :owned_teams, class_name: 'Team', foreign_key: 'owner_id', dependent: :destroy
  has_many :sent_team_invitations, class_name: 'TeamInvitation', foreign_key: 'inviter_id', dependent: :nullify

  # Check for pending team invitations after account creation
  after_create :accept_pending_team_invitations

  private

  def accept_pending_team_invitations
    TeamInvitation.pending.where(email: email).find_each do |invitation|
      invitation.accept!(self)
    end
  end
end
