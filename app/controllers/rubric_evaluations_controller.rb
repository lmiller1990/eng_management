require "debug"

class RubricEvaluationsController < ApplicationController
  def create
    account = Account.find(params.expect(:account_id))
    rubric = Rubric.find(rubric_evaluation_params[:rubric_id])
    @evaluation = RubricEvaluation.create!(account:, rubric:)
    redirect_to edit_account_rubric_evaluation_path(account, @evaluation)
  end

  def edit
    @evaluation = RubricEvaluation.find(params.expect(:id))
    @rubric = @evaluation.rubric
  end

  private

  def rubric_evaluation_params
    params.require(:rubric_evaluation).permit(:rubric_id)
  end
end
