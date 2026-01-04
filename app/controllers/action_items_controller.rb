class ActionItemsController < ApplicationController
  before_action :set_meeting
  before_action :set_action_item, only: %i[ edit update destroy ]

  # GET /meetings/:meeting_id/action_items
  def index
    @action_items = @meeting.action_items
  end

  # GET /meetings/:meeting_id/action_items/new
  def new
    @action_item = @meeting.action_items.build
  end

  # GET /meetings/:meeting_id/action_items/:id/edit
  def edit
  end

  # POST /meetings/:meeting_id/action_items
  def create
    @action_item = @meeting.action_items.build(action_item_params)
    @action_item.account = current_account

    respond_to do |format|
      if @action_item.save
        format.html { redirect_to @meeting, notice: "Action item was successfully created." }
        format.json { render :show, status: :created, location: [@meeting, @action_item] }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @action_item.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /meetings/:meeting_id/action_items/:id
  def update
    respond_to do |format|
      if @action_item.update(action_item_params)
        format.html { redirect_to @meeting, notice: "Action item was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: [@meeting, @action_item] }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @action_item.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meetings/:meeting_id/action_items/:id
  def destroy
    @action_item.destroy!

    respond_to do |format|
      format.html { redirect_to @meeting, notice: "Action item was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private

  def set_meeting
    @meeting = Meeting.find(params[:meeting_id])
  end

  def set_action_item
    @action_item = @meeting.action_items.find(params[:id])
  end

  def action_item_params
    params.expect(action_item: [:title])
  end
end
