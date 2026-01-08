class HomeController < ApplicationController
  skip_before_action :authenticate
  layout false

  def index
  end
end
