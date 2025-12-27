namespace :ses do
  desc "Check SES account status and configuration"
  task check: :environment do
    require "aws-sdk-sesv2"

    client = Aws::SESV2::Client.new(
      region: ENV["AWS_REGION"],
      access_key_id: ENV["AWS_ACCESS_KEY_ID"],
      secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"]
    )

    puts "=" * 80
    puts "AWS SES Configuration Check"
    puts "=" * 80
    puts

    # Check account status
    begin
      account = client.get_account
      puts "✓ Account Status:"
      puts "  Production Access: #{account.production_access_enabled ? 'YES ✓' : 'NO - IN SANDBOX ⚠️'}"

      if account.production_access_enabled
        puts "  Daily Send Quota: #{account.send_quota.max_24_hour_send}"
        puts "  Max Send Rate: #{account.send_quota.max_send_rate} emails/second"
        puts "  Sent Last 24h: #{account.send_quota.sent_last_24_hours}"
      else
        puts
        puts "  ⚠️  WARNING: You are in SES SANDBOX mode!"
        puts "  This means you can ONLY send to verified email addresses."
        puts "  To request production access:"
        puts "  https://console.aws.amazon.com/ses/home?region=#{ENV['AWS_REGION']}#/account"
      end
      puts
    rescue => e
      puts "✗ Error checking account: #{e.message}"
      puts
    end

    # Check domain identity
    begin
      domain = client.get_email_identity(email_identity: "notae.dev")
      puts "✓ Domain Identity (notae.dev):"
      puts "  Verified: #{domain.verified_for_sending_status ? 'YES ✓' : 'NO ✗'}"
      puts "  DKIM Status: #{domain.dkim_attributes&.status || 'Not configured'}"
      puts
    rescue => e
      puts "✗ Domain identity check failed: #{e.message}"
      puts
    end

    # Check email address identity (should NOT exist)
    begin
      email = client.get_email_identity(email_identity: "notifications@notae.dev")
      puts "⚠️  Email Identity (notifications@notae.dev) EXISTS"
      puts "  This can override domain settings - consider deleting it."
      puts "  Delete with: aws sesv2 delete-email-identity --email-identity notifications@notae.dev"
      puts
    rescue Aws::SESV2::Errors::NotFoundException
      puts "✓ Email identity does NOT exist (good - using domain identity)"
      puts
    rescue => e
      puts "✗ Error checking email identity: #{e.message}"
      puts
    end

    # Check suppression list
    begin
      puts "Checking suppression list..."
      suppressions = client.list_suppressed_destinations(page_size: 10)
      if suppressions.suppressed_destination_summaries.empty?
        puts "✓ No suppressed destinations"
      else
        puts "⚠️  Found suppressed destinations:"
        suppressions.suppressed_destination_summaries.each do |dest|
          puts "  - #{dest.email_address} (#{dest.reason})"
        end
      end
      puts
    rescue => e
      puts "✗ Error checking suppression list: #{e.message}"
      puts
    end

    puts "=" * 80
    puts "ActionMailer Configuration:"
    puts "=" * 80
    puts "  Delivery Method: #{ActionMailer::Base.delivery_method}"
    puts "  From Address: #{ApplicationMailer.default[:from]}"
    puts "  Default Host: #{Rails.application.config.action_mailer.default_url_options[:host]}"
    puts
    puts "=" * 80
  end

  desc "Send a test email"
  task :test, [ :to_address ] => :environment do |t, args|
    to_address = args[:to_address] || ENV["TEST_EMAIL"]

    if to_address.blank?
      puts "Usage: rails ses:test[your@email.com]"
      puts "   or: TEST_EMAIL=your@email.com rails ses:test"
      exit 1
    end

    puts "Sending test email to: #{to_address}"
    puts "From: #{ApplicationMailer.default[:from]}"
    puts

    begin
      # Create a simple test mailer class
      class TestMailer < ApplicationMailer
        def test_email(to_address)
          mail(
            to: to_address,
            subject: "SES Test Email - #{Time.current}",
            body: "This is a test email from your Rails app.\n\nSent at: #{Time.current}\n\nIf you received this, SES is working!"
          )
        end
      end

      mail = TestMailer.test_email(to_address)
      result = mail.deliver_now

      puts "✓ Email sent!"
      puts "  SES Message ID: #{mail.header[:ses_message_id]&.value}"
      puts
      puts "Note: Check your logs for detailed information."
      puts "If you don't receive it:"
      puts "  1. Run 'rails ses:check' to verify configuration"
      puts "  2. Check if you're in sandbox mode (recipient must be verified)"
      puts "  3. Check spam folder"
      puts "  4. Verify recipient email in SES console if in sandbox"
    rescue => e
      puts "✗ Failed to send: #{e.message}"
      puts e.backtrace.first(5)
    end
  end
end
