# SES Debugging and Event Tracking
Rails.application.config.after_initialize do
  # Add interceptor to log all outgoing emails in production
  if Rails.env.production?
    class SesEmailInterceptor
      def self.delivering_email(message)
        Rails.logger.info "=" * 80
        Rails.logger.info "[SES EMAIL] Attempting to send email"
        Rails.logger.info "  From: #{message.from}"
        Rails.logger.info "  To: #{message.to}"
        Rails.logger.info "  Cc: #{message.cc}" if message.cc.present?
        Rails.logger.info "  Bcc: #{message.bcc}" if message.bcc.present?
        Rails.logger.info "  Subject: #{message.subject}"
        Rails.logger.info "  Message ID: #{message.message_id}"
        Rails.logger.info "=" * 80
      end
    end

    class SesEmailObserver
      def self.delivered_email(message)
        ses_message_id = message.header[:ses_message_id]&.value
        Rails.logger.info "=" * 80
        Rails.logger.info "[SES SUCCESS] Email sent successfully"
        Rails.logger.info "  To: #{message.to}"
        Rails.logger.info "  Subject: #{message.subject}"
        Rails.logger.info "  SES Message ID: #{ses_message_id}"
        Rails.logger.info "  ⚠️  Note: 'Success' means SES accepted it, NOT that it was delivered!"
        Rails.logger.info "  Check: 1) Are you in SES Sandbox? 2) Is recipient verified?"
        Rails.logger.info "=" * 80
      end
    end

    ActionMailer::Base.register_interceptor(SesEmailInterceptor)
    ActionMailer::Base.register_observer(SesEmailObserver)
  end
end
