# Check if SolidQueue jobs are being processed
# This helps catch the common issue of using deliver_later without a worker running

if Rails.env.production?
  Rails.application.config.after_initialize do
    # Check queue health periodically (every 5 minutes)
    Thread.new do
      loop do
        sleep 300 # 5 minutes

        begin
          # Count pending jobs older than 5 minutes
          pending_count = SolidQueue::Job.where(finished_at: nil)
            .where("created_at < ?", 5.minutes.ago)
            .count

          if pending_count > 0
            Rails.logger.warn "=" * 80
            Rails.logger.warn "[SOLID QUEUE WARNING] #{pending_count} jobs pending for >5 minutes!"
            Rails.logger.warn "This usually means:"
            Rails.logger.warn "  1. No worker process is running (check: ps aux | grep solid_queue)"
            Rails.logger.warn "  2. Workers are overloaded"
            Rails.logger.warn ""
            Rails.logger.warn "Solution: Start a worker with 'rails solid_queue:start'"
            Rails.logger.warn "Or use deliver_now instead of deliver_later for emails"
            Rails.logger.warn "=" * 80
          end
        rescue => e
          # Silently fail if SolidQueue tables don't exist yet
          Rails.logger.debug "SolidQueue check failed: #{e.message}"
        end
      end
    end
  end
end
