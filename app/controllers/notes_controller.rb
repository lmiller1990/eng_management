class NotesController < ApplicationController
  before_action :set_meeting
  before_action :set_note, only: %i[ edit update destroy ]

  # GET /meetings/:meeting_id/notes
  def index
    @notes = @meeting.notes
  end

  # GET /meetings/:meeting_id/notes/new
  def new
    @note = @meeting.notes.build
  end

  # GET /meetings/:meeting_id/notes/:id/edit
  def edit
  end

  # POST /meetings/:meeting_id/notes
  def create
    @note = @meeting.notes.build(note_params)
    @note.account = rodauth.account

    respond_to do |format|
      if @note.save
        format.html { redirect_to @meeting, notice: "Note was successfully created." }
        format.json { render :show, status: :created, location: [@meeting, @note] }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @note.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /meetings/:meeting_id/notes/:id
  def update
    respond_to do |format|
      if @note.update(note_params)
        format.html { redirect_to @meeting, notice: "Note was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: [@meeting, @note] }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @note.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meetings/:meeting_id/notes/:id
  def destroy
    @note.destroy!

    respond_to do |format|
      format.html { redirect_to @meeting, notice: "Note was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    def set_meeting
      @meeting = Meeting.find(params[:meeting_id])
    end

    def set_note
      @note = @meeting.notes.find(params[:id])
    end

    def note_params
      params.expect(note: [ :content ])
    end
end
