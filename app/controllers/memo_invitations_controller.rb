class MemoInvitationsController < ApplicationController
  skip_before_action :authenticate, only: [ :accept, :setup_password, :complete_setup ]
  layout "authentication", only: [ :setup_password ]

  before_action :set_memo, only: [ :create, :destroy ]
  before_action :set_invitation_by_token, only: [ :accept, :setup_password, :complete_setup ]

  # POST /memos/:memo_id/invitations
  def create
    email = params[:email]&.downcase&.strip

    # Check if account already exists
    existing_account = Account.where(status: [ :verified, :unverified ]).find_by(email: email)

    if existing_account
      # Check if already an editor
      if @memo.editors.include?(existing_account) || @memo.owner == existing_account
        redirect_to @memo, alert: "#{email} already has access to this memo."
        return
      end

      # Add directly as editor (no invitation needed)
      @memo.editors << existing_account
      redirect_to @memo, notice: "#{email} has been added as an editor."
    else
      # Create placeholder account
      account = Account.create!(email: email, status: :unverified)

      # Create invitation
      @invitation = @memo.memo_invitations.build(
        email: email,
        inviter: current_account
      )

      if @invitation.save
        # Send invitation email
        MemoInvitationMailer.invite_to_edit(@invitation).deliver_later
        redirect_to @memo, notice: "Invitation sent to #{email}."
      else
        account.destroy if account.persisted? && account.owned_memos.none? && account.editable_memos.none?
        redirect_to @memo, alert: "Failed to send invitation: #{@invitation.errors.full_messages.join(', ')}"
      end
    end
  end

  # DELETE /memos/:memo_id/invitations/:id
  def destroy
    @invitation = @memo.memo_invitations.find(params[:id])
    @invitation.destroy
    redirect_to @memo, notice: "Invitation cancelled."
  end

  # GET /invitations/:token/accept
  def accept
    if @invitation.expired?
      render :expired and return
    end

    if @invitation.accepted?
      redirect_to @invitation.memo, notice: "You already have access to this memo."
      return
    end

    # Case 1: User is logged in
    if rodauth.logged_in?
      if current_account.email != @invitation.email
        redirect_to @invitation.memo, alert: "This invitation is for #{@invitation.email}. Please log out and try again."
        return
      end

      @invitation.accept!(current_account)
      redirect_to @invitation.memo, notice: "You can now edit this memo!"
      return
    end

    # Case 2: Account exists but no password set (placeholder account)
    account = Account.find_by(email: @invitation.email)
    if account&.password_hash.nil?
      redirect_to setup_password_memo_invitation_path(token: @invitation.token)
      return
    end

    # Case 3: No account or account has password → redirect to signup/login
    session[:memo_invitation_token] = @invitation.token
    redirect_to rodauth.create_account_path
  end

  # GET /invitations/:token/setup-password
  def setup_password
    if @invitation.expired?
      render :expired and return
    end

    if @invitation.accepted?
      redirect_to @invitation.memo
      return
    end

    @account = Account.find_by(email: @invitation.email)
    if @account.nil? || @account.password_hash.present?
      redirect_to accept_memo_invitation_path(@invitation.token)
      nil
    end
  end

  # POST /invitations/:token/complete-setup
  def complete_setup
    if @invitation.expired?
      render :expired and return
    end

    if @invitation.accepted?
      redirect_to @invitation.memo
      return
    end

    @account = Account.find_by(email: @invitation.email)
    password = params[:password]
    password_confirmation = params[:password_confirmation]

    # Validate password
    if password.blank?
      @error = "Password can't be blank"
      render :setup_password and return
    end

    if password != password_confirmation
      @error = "Passwords don't match"
      render :setup_password and return
    end

    if password.length < 8
      @error = "Password must be at least 8 characters"
      render :setup_password and return
    end

    # Update account with password and verify
    @account.update!(
      password_hash: BCrypt::Password.create(password, cost: BCrypt::Engine::DEFAULT_COST),
      status: :verified
    )

    # Accept invitation
    @invitation.accept!(@account)

    # Log the user in
    session[:account_id] = @account.id
    rodauth.remember_login if params[:remember]

    redirect_to @invitation.memo, notice: "Welcome! You can now edit this memo."
  end

  private

  def set_memo
    @memo = Memo.find(params[:memo_id])
  end

  def set_invitation_by_token
    @invitation = MemoInvitation.find_by!(token: params[:token])
  end
end
