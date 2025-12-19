class TeamInvitationsController < ApplicationController
  before_action :set_team, only: [:create, :destroy]
  before_action :authorize_team_member, only: [:create, :destroy]
  skip_before_action :authenticate, only: [:accept]

  def create
    @invitation = @team.team_invitations.build(invitation_params)
    @invitation.inviter = rodauth.account

    # Check if account with this email already exists
    existing_account = Account.where(status: [:verified, :unverified]).find_by(email: @invitation.email)

    if existing_account
      # Account exists, add them directly to the team
      if @team.accounts.include?(existing_account)
        redirect_to @team, alert: "#{@invitation.email} is already a member of this team."
      else
        @team.team_memberships.create!(account: existing_account, role: 'member')
        redirect_to @team, notice: "#{@invitation.email} has been added to the team."
      end
    else
      # Account doesn't exist, create invitation and send email
      if @invitation.save
        TeamInvitationMailer.invite_to_team(@invitation).deliver_later
        redirect_to @team, notice: "Invitation sent to #{@invitation.email}."
      else
        redirect_to @team, alert: @invitation.errors.full_messages.join(', ')
      end
    end
  end

  def destroy
    @invitation = @team.team_invitations.find(params[:id])
    @invitation.destroy!

    redirect_to @team, notice: "Invitation was cancelled.", status: :see_other
  end

  def accept
    @invitation = TeamInvitation.find_by!(token: params[:token])

    if @invitation.expired?
      redirect_to root_path, alert: "This invitation has expired."
      return
    end

    if @invitation.accepted?
      redirect_to root_path, alert: "This invitation has already been accepted."
      return
    end

    if rodauth.logged_in?
      # User is logged in, accept invitation
      if @invitation.accept!(rodauth.account)
        redirect_to @invitation.team, notice: "You have joined #{@invitation.team.name}!"
      else
        redirect_to root_path, alert: "Could not accept invitation."
      end
    else
      # User not logged in, store token in session and redirect to login/signup
      session[:team_invitation_token] = @invitation.token
      redirect_to rodauth.create_account_path, notice: "Please create an account to join #{@invitation.team.name}."
    end
  end

  private

  def set_team
    @team = Team.find(params[:team_id])
  end

  def invitation_params
    params.require(:team_invitation).permit(:email)
  end

  def authorize_team_member
    unless @team.accounts.include?(rodauth.account)
      redirect_to teams_path, alert: "You don't have access to this team."
    end
  end
end
