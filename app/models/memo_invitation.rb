class MemoInvitation < ApplicationRecord
  belongs_to :memo
  belongs_to :inviter, class_name: "Account"

  validates :email, presence: true,
            format: { with: URI::MailTo::EMAIL_REGEXP },
            uniqueness: { scope: :memo_id, conditions: -> { where(accepted_at: nil) } }

  before_validation :generate_token, on: :create
  before_validation :set_expires_at, on: :create

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

  def accept!(account)
    transaction do
      # Add account as editor
      memo.memo_editors.create!(account: account)

      # Mark invitation as accepted
      update!(accepted_at: Time.current)
    end
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def set_expires_at
    self.expires_at ||= 7.days.from_now
  end
end
