class MeetingParticipantsController < ApplicationController
  before_action :set_meeting

  # POST /meetings/:meeting_id/participants
  def create
    @meeting_participant = @meeting.meeting_participants.build(meeting_participant_params)

    respond_to do |format|
      if @meeting_participant.save
        format.html { redirect_to @meeting, notice: "Participant was successfully added." }
        format.json { render :show, status: :created, location: @meeting }
      else
        format.html { redirect_to @meeting, alert: "Could not add participant: #{@meeting_participant.errors.full_messages.join(", ")}", status: :unprocessable_entity }
        format.json { render json: @meeting_participant.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meetings/:meeting_id/participants/:id
  def destroy
    @meeting_participant = @meeting.meeting_participants.find(params[:id])
    @meeting_participant.destroy!

    respond_to do |format|
      format.html { redirect_to @meeting, notice: "Participant was successfully removed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private

  def set_meeting
    @meeting = Meeting.find(params[:meeting_id])
  end

  def meeting_participant_params
    params.expect(meeting_participant: [:account_id])
  end
end
