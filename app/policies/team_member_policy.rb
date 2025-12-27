# frozen_string_literal: true

class TeamMemberPolicy < ApplicationPolicy
  def show?
    # Allow if:
    # 1. Current user is the team owner (can view any member's notes)
    # 2. Current user is viewing their own notes with the owner
    team_owner? || viewing_own_notes?
  end

  def show_invitation?
    # Only team owner can view pending invitation notes
    team_owner?
  end

  private

  def team
    # record is a TeamMemberContext struct
    record.team
  end

  def member
    # record is a TeamMemberContext struct
    record.member
  end

  def team_owner?
    team.owner == account
  end

  def viewing_own_notes?
    # Member can view their own 1-on-1 with the owner
    # member might be nil for pending invitations
    member && member == account
  end
end
