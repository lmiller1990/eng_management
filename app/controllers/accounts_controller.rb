class AccountsController < ApplicationController
  def index
    @accounts = Account.all.order(email: :asc)
  end

  def show
    @account = Account.find(params.expect(:id))
  end
end
