class AccountsController < ApplicationController
  def index
    @accounts = Account.all.order(email: :asc)
  end

  def show
    @account = Account.find(params.expect(:id))
    @rubrics = Rubric.all
    @rubric_evaluation = RubricEvaluation.new(account: @account)
  end
end
