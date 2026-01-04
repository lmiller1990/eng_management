class DimensionScoresController < ApplicationController
  def new
    @dimension_id = params[:dimension_id]
    @job_title_id = params[:job_title_id]
    @evaluation_id = params[:evaluation_id]

    # Find or initialize the dimension score
    @dimension_score = DimensionScore.find_or_initialize_by(
      rubric_evaluation_id: @evaluation_id,
      dimension_id: @dimension_id,
    )
  end

  def create
    @dimension_score = DimensionScore.find_or_initialize_by(
      rubric_evaluation_id: dimension_score_params[:rubric_evaluation_id],
      dimension_id: dimension_score_params[:dimension_id],
    )

    @dimension_score.assign_attributes(dimension_score_params)

    if @dimension_score.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to root_path, notice: "Evaluation saved successfully!" }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def dimension_score_params
    params.require(:dimension_score).permit(:dimension_id, :rubric_evaluation_id, :score, :notes)
  end
end
