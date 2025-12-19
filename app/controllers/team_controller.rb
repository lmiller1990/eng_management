class TeamController < ApplicationController
  def index
    @team = rodauth.account.teams.order(:created_at, :desc).first
  end
end
