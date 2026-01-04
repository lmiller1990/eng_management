class TeamMembersController < ApplicationController
  # Simple struct to hold team and member for authorization
  TeamMemberContext = Struct.new(:team, :member)

  before_action :set_team
  before_action :set_member
  after_action :verify_authorized

  def show
    # Authorize: pass both team and member to the policy
    # Allows owner to view any member's notes, or members to view their own
    context = TeamMemberContext.new(@team, @member)
    authorize context, policy_class: TeamMemberPolicy

    # Find the memo associated with this member
    @memo = find_one_on_one_memo

    if @memo.nil?
      # Handle case where no memo exists (shouldn't happen for new invites)
      flash[:alert] = "No 1-on-1 memo found for this member"
      redirect_to team_path(@team)
    else
      @initial_yjs_state = encode_yjs_state(@memo.yjs_state)
    end
  end

  private

  def set_team
    @team = Team.find(params[:team_id])
  end

  def set_member
    @member = Account.find(params[:id])
    # Verify member belongs to team
    member_in_team = @team.accounts.include?(@member)
    member_invited = @team.team_invitations.any? { |r| r.email == @member.email }

    if not member_in_team and not member_invited
      flash[:alert] = "Member not found in this team"
      redirect_to team_path(@team)
    end
  end

  def find_one_on_one_memo
    # Find the invitation that created the relationship
    invitation = TeamInvitation.where(
      team: @team,
      inviter: @team.owner,
      email: @member.email,
    ).first

    invitation&.memo
  end

  def encode_yjs_state(state)
    return "" if state.nil?

    Y::Lib0::Encoding.encode_uint8_array_to_base64(state.unpack("C*"))
  end
end
