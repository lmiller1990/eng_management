class TeamsController < ApplicationController
  before_action :set_team, only: [:show, :edit, :update, :destroy]
  before_action :authorize_team_access, only: [:show]
  before_action :authorize_team_admin, only: [:edit, :update, :destroy]

  def index
    @teams = rodauth.account.teams.order(created_at: :desc)
  end

  def show
    @team_memberships = @team.team_memberships.includes(:account).order(created_at: :asc)
    @pending_invitations = @team.team_invitations.pending.order(created_at: :desc)
  end

  def new
    @team = Team.new
  end

  def create
    @team = Team.new(team_params)
    @team.owner = rodauth.account

    if @team.save
      redirect_to @team, notice: "Team was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @team.update(team_params)
      redirect_to @team, notice: "Team was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @team.destroy!
    redirect_to teams_path, notice: "Team was successfully deleted.", status: :see_other
  end

  private

  def set_team
    @team = Team.find(params[:id])
  end

  def team_params
    params.require(:team).permit(:name, :description)
  end

  def authorize_team_access
    unless @team.accounts.include?(rodauth.account)
      redirect_to teams_path, alert: "You don't have access to this team."
    end
  end

  def authorize_team_admin
    membership = @team.team_memberships.find_by(account: rodauth.account)
    unless membership&.admin? || membership&.owner?
      redirect_to @team, alert: "You don't have permission to perform this action."
    end
  end
end
