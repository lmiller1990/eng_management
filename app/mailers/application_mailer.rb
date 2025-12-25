class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SES_FROM_EMAIL", "noreply@example.com")
  layout "mailer"
end
