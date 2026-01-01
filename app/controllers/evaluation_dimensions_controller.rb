class EvaluationDimensionsController < ApplicationController
  def create
    evaluation = RubricEvaluation.find(params.expect(:evaluation_id))
    dimension_id = params.expect(:dimension_id)
    job_title_id = params.expect(:job_title_id)

    Rails.logger.info("Rubric comment: evaluation_id=#{evaluation.id}, dimension_id=#{dimension_id}, job_title_id=#{job_title_id}")

    render json: { success: true }
  end

  def update
    evaluation = RubricEvaluation.find(params.expect(:evaluation_id))
    dimension_id = params[:id]
    job_title_id = params.expect(:job_title_id)

    Rails.logger.info("Update rubric comment: evaluation_id=#{evaluation.id}, dimension_id=#{dimension_id}, job_title_id=#{job_title_id}")

    render json: { success: true }
  end
end
