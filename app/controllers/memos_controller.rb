class MemosController < ApplicationController
  before_action :set_memo, only: %i[ show edit update destroy ]
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  # GET /memos or /memos.json
  def index
    @memos = policy_scope(Memo).order(updated_at: :desc)
  end

  # GET /memos/1 or /memos/1.json
  def show
    authorize @memo
  end

  # GET /memos/new
  def new
    @memo = Memo.new(title: "")
    authorize @memo
    @memo.owner = current_account
    @memo.save!
    redirect_to edit_memo_path(@memo)
  end

  # GET /memos/1/edit
  def edit
    authorize @memo
    @initial_yjs_state = encode_yjs_state(@memo.yjs_state)
  end

  # POST /memos or /memos.json
  def create
    @memo = Memo.new(memo_params)
    authorize @memo
    @memo.owner = current_account

    respond_to do |format|
      if @memo.save
        format.html { redirect_to @memo, notice: "Memo was successfully created." }
        format.json { render :show, status: :created, location: @memo }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @memo.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /memos/1 or /memos/1.json
  def update
    authorize @memo
    respond_to do |format|
      if @memo.update(memo_params)
        format.html { redirect_to @memo, notice: "Memo was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @memo }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @memo.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /memos/1 or /memos/1.json
  def destroy
    authorize @memo
    @memo.destroy!

    respond_to do |format|
      format.html { redirect_to memos_path, notice: "Memo was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_memo
    @memo = Memo.find(params.expect(:id))
  end

  # Only allow a list of trusted parameters through.
  def memo_params
    params.expect(memo: [:title, :content])
  end

  def encode_yjs_state(state)
    return "" if state.nil?

    Y::Lib0::Encoding.encode_uint8_array_to_base64(state.unpack("C*"))
  end
end
