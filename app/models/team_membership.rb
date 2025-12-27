class TeamMembership < ApplicationRecord
  belongs_to :team
  belongs_to :account

  enum :role, { member: "member", admin: "admin", owner: "owner" }

  validates :account_id, uniqueness: {
    scope: :team_id,
    message: "is already a member of this team"
  }
  validates :role, presence: true, inclusion: { in: roles.keys }

  # Prevent removing the last owner
  before_destroy :ensure_team_has_owner

  private

  def ensure_team_has_owner
    if owner? && team.team_memberships.where(role: "owner").count == 1
      errors.add(:base, "Cannot remove the last owner of the team")
      throw :abort
    end
  end
end
