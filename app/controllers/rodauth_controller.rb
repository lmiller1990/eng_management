class RodauthController < ApplicationController
  # Skip authentication requirement for auth pages
  skip_before_action :authenticate

  # Used by Rodauth for rendering views, CSRF protection, running any
  # registered action callbacks and rescue handlers, instrumentation etc.

  # Controller callbacks and rescue handlers will run around Rodauth endpoints.
  # before_action :verify_captcha, only: :login, if: -> { request.post? }
  # rescue_from("SomeError") { |exception| ... }

  # Use authentication layout for auth pages, application layout for account management
  layout -> do
           case rodauth.current_route
           when :login, :create_account, :verify_account, :verify_account_resend,
                :reset_password, :reset_password_request
             "authentication"
           else
             "application"
           end
         end
end
