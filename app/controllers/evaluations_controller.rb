class EvaluationsController < ApplicationController
  def new
    account = Account.find(params.expect(:account_id))
    @evaluation = RubricEvaluation.new(account:)
  end
end
