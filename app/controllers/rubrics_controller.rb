class RubricsController < ApplicationController
  def index
    @rubrics = Rubric.all
  end

  def new
    @rubric = Rubric.new
  end

  def create
    @rubric = Rubric.new(rubric_params)

    if @rubric.save
      redirect_to @rubric, notice: "Created successfully."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @rubric = Rubric.find(params.expect(:id))
  end

  private

  # Only allow a list of trusted parameters through.
  def rubric_params
    params.expect(rubric: [ :name, :description ])
  end
end
