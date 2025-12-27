# Add SES Configuration Set to all outgoing emails for event tracking
Rails.application.config.after_initialize do
  if Rails.env.production?
    # Get the configuration set name from environment or use default
    configuration_set = ENV.fetch("SES_CONFIGURATION_SET", "production-email-events")

    class SesConfigurationSetInterceptor
      def self.delivering_email(message)
        # Add the configuration set header for SES event tracking
        message.header["X-SES-CONFIGURATION-SET"] = ENV.fetch("SES_CONFIGURATION_SET", "production-email-events")
      end
    end

    ActionMailer::Base.register_interceptor(SesConfigurationSetInterceptor)
  end
end
