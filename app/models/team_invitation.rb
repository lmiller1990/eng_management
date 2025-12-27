class TeamInvitation < ApplicationRecord
  belongs_to :team
  belongs_to :inviter, class_name: "Account"
  belongs_to :memo, optional: true

  validates :email, presence: true, format: {
    with: URI::MailTo::EMAIL_REGEXP,
    message: "must be a valid email address"
  }
  validates :email, uniqueness: {
    scope: :team_id,
    conditions: -> { where(accepted_at: nil) },
    message: "already has a pending invitation to this team"
  }

  before_validation :generate_token, on: :create
  before_validation :set_expiration, on: :create
  after_create :create_one_on_one_memo

  scope :pending, -> { where(accepted_at: nil).where("expires_at > ?", Time.current) }
  scope :expired, -> { where(accepted_at: nil).where("expires_at <= ?", Time.current) }
  scope :accepted, -> { where.not(accepted_at: nil) }

  def pending?
    accepted_at.nil? && expires_at > Time.current
  end

  def expired?
    accepted_at.nil? && expires_at <= Time.current
  end

  def accepted?
    accepted_at.present?
  end

  def invitee
    Account.find_by(email:)
  end

  def accept!(account)
    return false unless pending?

    ActiveRecord::Base.transaction do
      # Create team membership
      team.team_memberships.create!(account: account, role: "member")

      # Mark invitation as accepted
      update!(accepted_at: Time.current)
    end
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def set_expiration
    self.expires_at ||= 7.days.from_now
  end

  def create_one_on_one_memo
    # Find the account by email (should exist as a placeholder account created before invitation)
    account = Account.find_by(email:)
    return unless account # Safety check

    # Create the 1-on-1 memo with inviter as owner
    one_on_one_memo = Memo.create!(
      owner: inviter,
      title: "Notes",
      memo_type: :team_one_on_one
    )

    # Add the invited account as an editor
    one_on_one_memo.editors << account

    # Link the memo to this invitation
    update_column(:memo_id, one_on_one_memo.id)
  end
end
