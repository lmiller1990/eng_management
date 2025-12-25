class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SES_FROM_EMAIL", "notifications@notae.com")
  layout "mailer"
end
