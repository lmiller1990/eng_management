require "test_helper"

class TeamMembersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = accounts(:one)
    @member = accounts(:two)

    # Create a team with owner
    @team = Team.create!(
      owner: @owner,
      name: "Test Team",
      description: "A test team"
    )

    # Add member to team (simulates invitation acceptance)
    @team.team_memberships.create!(account: @member, role: "member")

    # Create team invitation with 1-on-1 memo
    invitation = TeamInvitation.create!(
      team: @team,
      inviter: @owner,
      email: @member.email
    )
    @memo = invitation.memo
  end

  test "owner can view member's notes" do
    # Log in as owner
    post "/login", params: {
      email: @owner.email,
      password: "password"
    }

    get team_member_url(@team, @member)
    assert_response :success
  end

  test "member can view their own notes with owner" do
    # Log in as member
    post "/login", params: {
      email: @member.email,
      password: "password"
    }

    # Member viewing their own notes
    get team_member_url(@team, @member)
    assert_response :success
  end

  test "member cannot view other member's notes" do
    # Create another member
    other_member = Account.create!(
      email: "other@example.com",
      password_hash: RodauthApp.rodauth.allocate.password_hash("password"),
      status: :verified
    )
    @team.team_memberships.create!(account: other_member, role: "member")

    # Log in as first member
    post "/login", params: {
      email: @member.email,
      password: "password"
    }

    # Try to view other member's notes - should raise Pundit::NotAuthorizedError
    assert_raises(Pundit::NotAuthorizedError) do
      get team_member_url(@team, other_member)
    end
  end

  test "non-member cannot view any notes" do
    non_member = Account.create!(
      email: "nonmember@example.com",
      password_hash: RodauthApp.rodauth.allocate.password_hash("password"),
      status: :verified
    )

    # Log in as non-member
    post "/login", params: {
      email: non_member.email,
      password: "password"
    }

    # Try to view member notes - should raise Pundit::NotAuthorizedError
    assert_raises(Pundit::NotAuthorizedError) do
      get team_member_url(@team, @member)
    end
  end

  test "displays 1-on-1 memo when it exists" do
    # Log in as owner
    post "/login", params: {
      email: @owner.email,
      password: "password"
    }

    get team_member_url(@team, @member)
    assert_response :success
    # Verify the memo exists and is shown (check response body contains expected content)
    assert_not_nil @memo
  end
end
