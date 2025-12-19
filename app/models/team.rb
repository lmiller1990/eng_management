class Team < ApplicationRecord
  belongs_to :owner, class_name: 'Account'
  has_many :team_memberships, dependent: :destroy
  has_many :accounts, through: :team_memberships
  has_many :team_invitations, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }

  # Ensure owner is automatically added as a member with owner role
  after_create :add_owner_as_member

  private

  def add_owner_as_member
    team_memberships.create!(account: owner, role: 'owner')
  end
end
