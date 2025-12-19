class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  # Require authentication for all pages
  before_action :authenticate

  private

  def current_account
    rodauth.rails_account
  end

  helper_method :current_account # skip if inheriting from ActionController::API

  def authenticate
    rodauth.require_authentication
  end
end
