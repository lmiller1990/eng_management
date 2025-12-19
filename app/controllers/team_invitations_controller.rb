class TeamInvitationsController < ApplicationController
  before_action :set_team, only: [ :create, :destroy ]
  before_action :authorize_team_member, only: [ :create, :destroy ]
  skip_before_action :authenticate, only: [ :accept, :setup_password, :complete_setup ]
  before_action :load_invitation, only: [ :accept, :setup_password, :complete_setup ]
  layout "authentication", only: [ :setup_password ]

  def create
    @invitation = @team.team_invitations.build(invitation_params)
    @invitation.inviter = current_account

    # Check if account with this email already exists
    existing_account = Account.where(status: [ :verified, :unverified ]).find_by(email: @invitation.email)

    if existing_account
      # Account exists, add them directly to the team
      if @team.accounts.include?(existing_account)
        redirect_to @team, alert: "#{@invitation.email} is already a member of this team."
      else
        @team.team_memberships.create!(account: existing_account, role: "member")
        redirect_to @team, notice: "#{@invitation.email} has been added to the team."
      end
    else
      # Account doesn't exist, create account and invitation, then send email
      account = Account.create!(email: @invitation.email, status: :unverified)

      if @invitation.save
        TeamInvitationMailer.invite_to_team(@invitation).deliver_later
        redirect_to @team, notice: "Invitation sent to #{@invitation.email}."
      else
        redirect_to @team, alert: @invitation.errors.full_messages.join(", ")
      end
    end
  end

  def destroy
    @invitation = @team.team_invitations.find(params[:id])
    @invitation.destroy!

    redirect_to @team, notice: "Invitation was cancelled.", status: :see_other
  end

  def accept
    if @invitation.expired?
      redirect_to root_path, alert: "This invitation has expired."
      return
    end

    if @invitation.accepted?
      redirect_to root_path, alert: "This invitation has already been accepted."
      return
    end

    if rodauth.logged_in?
      # User is logged in, check if invitation is for this user
      if current_account.email != @invitation.email
        Rails.logger.warn("Account #{current_account.id} (#{current_account.email}) attempted to accept invitation for #{@invitation.email}")
        redirect_to root_path, alert: "This invitation is for a different account."
        return
      end

      # Accept invitation
      if @invitation.accept!(current_account)
        redirect_to @invitation.team, notice: "You have joined #{@invitation.team.name}!"
      else
        redirect_to root_path, alert: "Could not accept invitation."
      end
    else
      # User not logged in, check if account exists
      account = Account.find_by(email: @invitation.email)

      if account && account.password_hash.nil?
        # Account exists but no password set, redirect to password setup
        redirect_to setup_password_team_invitation_path(token: @invitation.token), notice: "Please set a password to join #{@invitation.team.name}."
      else
        # No account exists, redirect to signup
        session[:team_invitation_token] = @invitation.token
        redirect_to rodauth.create_account_path, notice: "Please create an account to join #{@invitation.team.name}."
      end
    end
  end

  def setup_password
    # Show password setup form
  end

  def complete_setup
    account = Account.find_by(email: @invitation.email)

    if account.nil?
      redirect_to root_path, alert: "Account not found."
      return
    end

    if account.password_hash.present?
      redirect_to root_path, alert: "Account already has a password set."
      return
    end

    password = params[:password]

    # Validate password
    if password.blank?
      @error = "Password cannot be blank."
      render :setup_password
      return
    end

    if password.length < 8
      @error = "Password must be at least 8 characters long."
      render :setup_password
      return
    end

    if password.bytesize > 72
      @error = "Password is too long (maximum 72 bytes)."
      render :setup_password
      return
    end

    # Use Rodauth's password hashing
    password_hash = rodauth.send(:password_hash, password)
    account.update!(password_hash: password_hash, status: :verified)

    # Accept the invitation
    if @invitation.accept!(account)
      # Log the user in manually
      session[:account_id] = account.id
      redirect_to @invitation.team, notice: "Welcome to #{@invitation.team.name}!"
    else
      redirect_to root_path, alert: "Could not accept invitation."
    end
  end

  private

  def set_team
    @team = Team.find(params[:team_id])
  end

  def load_invitation
    @invitation = TeamInvitation.find_by!(token: params[:token])
  end

  def invitation_params
    params.require(:team_invitation).permit(:email)
  end

  def authorize_team_member
    unless @team.accounts.include?(current_account)
      redirect_to teams_path, alert: "You don't have access to this team."
    end
  end
end
