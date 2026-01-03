require "test_helper"

class MemosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @account = accounts(:owner)
    # Simulate logged in user by setting session
    post "/login", params: {
      email: @account.email,
      password: "password"
    }
  end

  test "index only shows shared memos, not team_one_on_one memos" do
    # Create a shared memo owned by the account
    shared_memo = Memo.create!(
      owner: @account,
      title: "Shared Memo Test",
      memo_type: :shared
    )

    # Create a team_one_on_one memo owned by the account
    one_on_one_memo = Memo.create!(
      owner: @account,
      title: "One-on-One Memo Test",
      memo_type: :team_one_on_one
    )

    get memos_url
    assert_response :success

    # Verify through policy_scope that shared memos are included
    scoped_memos = Pundit.policy_scope(@account, Memo)
    assert_includes scoped_memos, shared_memo, "Shared memo should be in policy scope"
    assert_not_includes scoped_memos, one_on_one_memo, "Team one-on-one memo should NOT be in policy scope"
  end

  test "index shows shared memos where account is owner" do
    shared_memo = Memo.create!(
      owner: @account,
      title: "My Shared Memo",
      memo_type: :shared
    )

    get memos_url
    assert_response :success

    scoped_memos = Pundit.policy_scope(@account, Memo)
    assert_includes scoped_memos, shared_memo
  end

  test "index shows shared memos where account is editor" do
    other_account = accounts(:existing_member)
    shared_memo = Memo.create!(
      owner: other_account,
      title: "Shared with Me",
      memo_type: :shared
    )
    shared_memo.editors << @account

    get memos_url
    assert_response :success

    scoped_memos = Pundit.policy_scope(@account, Memo)
    assert_includes scoped_memos, shared_memo
  end

  test "index does not show team_one_on_one memos even if account is editor" do
    other_account = accounts(:existing_member)
    one_on_one_memo = Memo.create!(
      owner: other_account,
      title: "1-on-1 with Other",
      memo_type: :team_one_on_one
    )
    one_on_one_memo.editors << @account

    get memos_url
    assert_response :success

    scoped_memos = Pundit.policy_scope(@account, Memo)
    assert_not_includes scoped_memos, one_on_one_memo
  end
end
