require "test_helper"

class ActionItemsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @action_item = action_items(:one)
  end

  test "should get index" do
    get action_items_url
    assert_response :success
  end

  test "should get new" do
    get new_action_item_url
    assert_response :success
  end

  test "should create action_item" do
    assert_difference("ActionItem.count") do
      post action_items_url, params: { action_item: { account_id: @action_item.account_id, meeting_id: @action_item.meeting_id, title: @action_item.title } }
    end

    assert_redirected_to action_item_url(ActionItem.last)
  end

  test "should show action_item" do
    get action_item_url(@action_item)
    assert_response :success
  end

  test "should get edit" do
    get edit_action_item_url(@action_item)
    assert_response :success
  end

  test "should update action_item" do
    patch action_item_url(@action_item), params: { action_item: { account_id: @action_item.account_id, meeting_id: @action_item.meeting_id, title: @action_item.title } }
    assert_redirected_to action_item_url(@action_item)
  end

  test "should destroy action_item" do
    assert_difference("ActionItem.count", -1) do
      delete action_item_url(@action_item)
    end

    assert_redirected_to action_items_url
  end
end
