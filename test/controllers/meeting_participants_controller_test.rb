require "test_helper"

class MeetingParticipantsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @meeting_participant = meeting_participants(:one)
  end

  test "should get index" do
    get meeting_participants_url
    assert_response :success
  end

  test "should get new" do
    get new_meeting_participant_url
    assert_response :success
  end

  test "should create meeting_participant" do
    assert_difference("MeetingParticipant.count") do
      post meeting_participants_url, params: { meeting_participant: { account_id: @meeting_participant.account_id, meeting_id: @meeting_participant.meeting_id } }
    end

    assert_redirected_to meeting_participant_url(MeetingParticipant.last)
  end

  test "should show meeting_participant" do
    get meeting_participant_url(@meeting_participant)
    assert_response :success
  end

  test "should get edit" do
    get edit_meeting_participant_url(@meeting_participant)
    assert_response :success
  end

  test "should update meeting_participant" do
    patch meeting_participant_url(@meeting_participant), params: { meeting_participant: { account_id: @meeting_participant.account_id, meeting_id: @meeting_participant.meeting_id } }
    assert_redirected_to meeting_participant_url(@meeting_participant)
  end

  test "should destroy meeting_participant" do
    assert_difference("MeetingParticipant.count", -1) do
      delete meeting_participant_url(@meeting_participant)
    end

    assert_redirected_to meeting_participants_url
  end
end
