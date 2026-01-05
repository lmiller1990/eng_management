class Account < ApplicationRecord
  include Rodauth::Rails.model
  enum :status, { unverified: 1, verified: 2, closed: 3 }

  # Struct for derived name components from email addresses
  DerivedName = Struct.new(:first_name, :last_name, :initials, keyword_init: true) do
    def full_name
      "#{first_name} #{last_name}".strip
    end
  end

  has_many :meeting_participants, dependent: :destroy
  has_many :meetings, through: :meeting_participants
  has_many :notes, dependent: :destroy
  has_many :action_items, dependent: :destroy
  has_many :rubric_evaluations

  # Memo relationships
  has_many :owned_memos, class_name: "Memo", foreign_key: "account_id", dependent: :destroy
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

  # Derive name components from email address
  #
  # @param derivation_fn [Proc] Optional custom derivation function
  #   The function should accept an email string and return a hash with keys:
  #   :first_name, :last_name, and :initials
  #
  # @return [DerivedName] Struct with first_name, last_name, initials, and full_name
  #
  # @example Default usage
  #   account = Account.new(email: "john.doe@example.com")
  #   names = account.derive_name
  #   names.first_name  # => "John"
  #   names.last_name   # => "Doe"
  #   names.initials    # => "JD"
  #   names.full_name   # => "John Doe"
  #
  # @example Custom derivation
  #   custom_fn = ->(email) {
  #     local = email.split('@').first
  #     { first_name: local.capitalize, last_name: "User", initials: local[0].upcase }
  #   }
  #   account.derive_name(custom_fn)
  #
  def derive_name(derivation_fn = DEFAULT_NAME_DERIVATION)
    result = derivation_fn.call(email)

    DerivedName.new(
      first_name: result[:first_name].to_s,
      last_name: result[:last_name].to_s,
      initials: result[:initials].to_s,
    )
  end

  def has_evalution_rubric?
    current_rubric != nil
  end

  def current_rubric
    rubric_evaluations.order(created_at: :desc).first
  end

  private

  # Default strategy for deriving names from email addresses
  # Handles various edge cases:
  # - "john.doe@example.com" => first: "John", last: "Doe"
  # - "john@example.com" => first: "John", last: ""
  # - "j.d.smith@example.com" => first: "J", last: "Smith" (uses first and last parts)
  # - "john_doe@example.com" => first: "John", last: "Doe" (splits on underscore too)
  DEFAULT_NAME_DERIVATION = lambda do |email|
    raise ArgumentError, "Email cannot be blank" if email.blank?

    # Extract the local part (before @)
    local_part = email.split("@").first.to_s

    # Split on dots and underscores, filter empty strings
    parts = local_part.split(/[._]/).reject(&:blank?)

    # Determine first and last names based on parts count
    case parts.length
    when 0
      first_name = ""
      last_name = ""
    when 1
      first_name = parts[0].capitalize
      last_name = ""
    else
      # Use first and last parts, ignore middle components
      first_name = parts.first.capitalize
      last_name = parts.last.capitalize
    end

    # Generate initials from first letter of each name component
    initials = [first_name, last_name]
      .reject(&:blank?)
      .map { |name| name[0].upcase }
      .join

    { first_name: first_name, last_name: last_name, initials: initials }
  end

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
