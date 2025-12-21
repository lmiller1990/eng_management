require "test_helper"

class MemoTest < ActiveSupport::TestCase
  test "defaults to shared memo_type" do
    memo = Memo.create!(
      owner: accounts(:one),
      title: "Test Memo"
    )

    assert_equal "shared", memo.memo_type
    assert memo.shared?
  end

  test "can create team_one_on_one memo" do
    memo = Memo.create!(
      owner: accounts(:one),
      title: "1-on-1 Notes",
      memo_type: :team_one_on_one
    )

    assert_equal "team_one_on_one", memo.memo_type
    assert memo.team_one_on_one?
  end

  test "shared scope returns only shared memos" do
    shared_memo = Memo.create!(
      owner: accounts(:one),
      title: "Shared Memo",
      memo_type: :shared
    )

    one_on_one_memo = Memo.create!(
      owner: accounts(:one),
      title: "1-on-1 Memo",
      memo_type: :team_one_on_one
    )

    shared_memos = Memo.shared
    assert_includes shared_memos, shared_memo
    assert_not_includes shared_memos, one_on_one_memo
  end

  test "team_one_on_one scope returns only team 1-on-1 memos" do
    shared_memo = Memo.create!(
      owner: accounts(:one),
      title: "Shared Memo",
      memo_type: :shared
    )

    one_on_one_memo = Memo.create!(
      owner: accounts(:one),
      title: "1-on-1 Memo",
      memo_type: :team_one_on_one
    )

    one_on_one_memos = Memo.team_one_on_one
    assert_includes one_on_one_memos, one_on_one_memo
    assert_not_includes one_on_one_memos, shared_memo
  end
end
