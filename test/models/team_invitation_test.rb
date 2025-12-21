require "test_helper"

class TeamInvitationTest < ActiveSupport::TestCase
  test "creates a 1-on-1 memo when invitation is created" do
    team = teams(:one)
    inviter = accounts(:one)
    invitee_email = "new.member@example.com"

    # Create placeholder account (simulates what happens in controller)
    invitee = Account.create!(email: invitee_email, status: :unverified)

    # Count memos before
    memo_count_before = Memo.count

    # Create invitation
    invitation = TeamInvitation.create!(
      team: team,
      inviter: inviter,
      email: invitee_email
    )

    # Verify memo was created
    assert_equal memo_count_before + 1, Memo.count
    assert_not_nil invitation.memo
    assert_equal "Notes", invitation.memo.title
  end

  test "1-on-1 memo has inviter as owner" do
    team = teams(:one)
    inviter = accounts(:one)
    invitee_email = "new.member@example.com"
    invitee = Account.create!(email: invitee_email, status: :unverified)

    invitation = TeamInvitation.create!(
      team: team,
      inviter: inviter,
      email: invitee_email
    )

    assert_equal inviter, invitation.memo.owner
  end

  test "1-on-1 memo has invitee as editor" do
    team = teams(:one)
    inviter = accounts(:one)
    invitee_email = "new.member@example.com"
    invitee = Account.create!(email: invitee_email, status: :unverified)

    invitation = TeamInvitation.create!(
      team: team,
      inviter: inviter,
      email: invitee_email
    )

    assert_includes invitation.memo.editors, invitee
  end

  test "does not create memo if invitee account does not exist" do
    team = teams(:one)
    inviter = accounts(:one)
    # Intentionally don't create the account

    memo_count_before = Memo.count

    invitation = TeamInvitation.create!(
      team: team,
      inviter: inviter,
      email: "nonexistent@example.com"
    )

    # Should not create memo if account doesn't exist
    assert_equal memo_count_before, Memo.count
    assert_nil invitation.memo
  end

  test "1-on-1 memo has team_one_on_one type" do
    team = teams(:one)
    inviter = accounts(:one)
    invitee_email = "new.member@example.com"
    invitee = Account.create!(email: invitee_email, status: :unverified)

    invitation = TeamInvitation.create!(
      team: team,
      inviter: inviter,
      email: invitee_email
    )

    assert_equal "team_one_on_one", invitation.memo.memo_type
    assert invitation.memo.team_one_on_one?
  end
end
