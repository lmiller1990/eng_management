class HomeController < ApplicationController
  skip_before_action :authenticate
  layout false

  def index
    # Redirect logged-in users to the app
    if rodauth.logged_in?
      redirect_to "/app/memos"
    end
  end
end
