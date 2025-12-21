class AccountsController < ApplicationController
  def index
    @accounts = Account.all.order(email: :asc)
  end
end
