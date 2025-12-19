class TeamMembershipsController < ApplicationController
  before_action :set_team
  before_action :authorize_team_member

  def destroy
    @membership = @team.team_memberships.find(params[:id])

    # Check if user can remove this member
    current_membership = @team.team_memberships.find_by(account: rodauth.account)
    can_remove = current_membership&.admin? || current_membership&.owner? || @membership.account == rodauth.account

    unless can_remove
      redirect_to @team, alert: "You don't have permission to remove this member."
      return
    end

    if @membership.destroy
      redirect_to @team, notice: "Member was successfully removed.", status: :see_other
    else
      redirect_to @team, alert: @membership.errors.full_messages.join(', ')
    end
  end

  private

  def set_team
    @team = Team.find(params[:team_id])
  end

  def authorize_team_member
    unless @team.accounts.include?(rodauth.account)
      redirect_to teams_path, alert: "You don't have access to this team."
    end
  end
end
