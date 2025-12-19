class MeetingParticipantsController < ApplicationController
  before_action :set_meeting_participant, only: %i[ show edit update destroy ]

  # GET /meeting_participants or /meeting_participants.json
  def index
    @meeting_participants = MeetingParticipant.all
  end

  # GET /meeting_participants/1 or /meeting_participants/1.json
  def show
  end

  # GET /meeting_participants/new
  def new
    @meeting_participant = MeetingParticipant.new
  end

  # GET /meeting_participants/1/edit
  def edit
  end

  # POST /meeting_participants or /meeting_participants.json
  def create
    @meeting_participant = MeetingParticipant.new(meeting_participant_params)

    respond_to do |format|
      if @meeting_participant.save
        format.html { redirect_to @meeting_participant, notice: "Meeting participant was successfully created." }
        format.json { render :show, status: :created, location: @meeting_participant }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @meeting_participant.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /meeting_participants/1 or /meeting_participants/1.json
  def update
    respond_to do |format|
      if @meeting_participant.update(meeting_participant_params)
        format.html { redirect_to @meeting_participant, notice: "Meeting participant was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @meeting_participant }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @meeting_participant.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meeting_participants/1 or /meeting_participants/1.json
  def destroy
    @meeting_participant.destroy!

    respond_to do |format|
      format.html { redirect_to meeting_participants_path, notice: "Meeting participant was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_meeting_participant
      @meeting_participant = MeetingParticipant.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def meeting_participant_params
      params.expect(meeting_participant: [ :meeting_id, :account_id ])
    end
end
