# AWS SES v2 Email Delivery Method for ActionMailer
# Register the delivery method with ActionMailer
Rails.application.config.after_initialize do
  ActionMailer::Base.add_delivery_method :ses_mailer, SesMailer
end

class SesMailer
  def initialize(settings = {})
    @settings = settings
  end

  def deliver!(mail)
    ses_client = Aws::SESV2::Client.new(
      region: ENV["AWS_REGION"] || "us-east-1",
      access_key_id: ENV["AWS_ACCESS_KEY_ID"],
      secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"]
    )

    # Extract recipients from the mail object
    to_addresses = mail.to || []
    cc_addresses = mail.cc || []
    bcc_addresses = mail.bcc || []

    # Build the destination object
    destination = {
      to_addresses: to_addresses
    }
    destination[:cc_addresses] = cc_addresses if cc_addresses.any?
    destination[:bcc_addresses] = bcc_addresses if bcc_addresses.any?

    # Prepare email content
    email_content = {
      simple: {
        subject: {
          data: mail.subject,
          charset: "UTF-8"
        },
        body: {
          text: {
            data: mail_text_part(mail),
            charset: "UTF-8"
          }
        }
      }
    }

    # Add HTML part if available
    if mail.html_part
      email_content[:simple][:body][:html] = {
        data: mail.html_part.body.to_s,
        charset: "UTF-8"
      }
    end

    # Send the email
    response = ses_client.send_email(
      from_email_address: mail.from.first || ENV["SES_FROM_EMAIL"],
      destination: destination,
      content: email_content,
      configuration_set_name: ENV["SES_CONFIG_SET"] # Optional: for tracking
    )

    response.message_id
  rescue => e
    mail.header[:delivery_status] = DeliveryStatus.failed(e.message)
    raise e
  end

  private

  def mail_text_part(mail)
    if mail.text_part
      mail.text_part.body.to_s
    elsif mail.body
      mail.body.to_s
    else
      # Fallback: strip HTML from the HTML part
      require "cgi"
      CGI.unescapeHTML(
        mail.html_part&.body&.to_s&.gsub(/<[^>]*>/, "") || ""
      )
    end
  end
end
