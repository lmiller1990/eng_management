# frozen_string_literal: true

class TeamMemberPolicy < ApplicationPolicy
  def show?
    # Only team owner can view 1-on-1 notes
    team_owner?
  end

  private

  def team_owner?
    # record is the team
    record.owner == account
  end
end
