namespace :queue do
  desc "Check background job queue health"
  task health: :environment do
    puts "=" * 80
    puts "Background Job Queue Health Check"
    puts "=" * 80
    puts

    begin
      total_jobs = SolidQueue::Job.count
      pending_jobs = SolidQueue::Job.where(finished_at: nil).count
      failed_jobs = SolidQueue::FailedExecution.count

      # Jobs pending for more than 5 minutes
      stuck_jobs = SolidQueue::Job.where(finished_at: nil)
        .where("created_at < ?", 5.minutes.ago)
        .count

      puts "Total Jobs: #{total_jobs}"
      puts "Pending Jobs: #{pending_jobs}"
      puts "Failed Jobs: #{failed_jobs}"
      puts "Stuck Jobs (>5 min): #{stuck_jobs}"
      puts

      if stuck_jobs > 0
        puts "⚠️  WARNING: #{stuck_jobs} jobs have been pending for more than 5 minutes!"
        puts ""
        puts "Recent stuck jobs:"
        SolidQueue::Job.where(finished_at: nil)
          .where("created_at < ?", 5.minutes.ago)
          .order(created_at: :desc)
          .limit(5)
          .each do |job|
            puts "  - #{job.class_name} (queued #{((Time.current - job.created_at) / 60).round} minutes ago)"
          end
        puts
        puts "This usually means no worker process is running."
        puts "Start a worker with: rails solid_queue:start"
        puts "Or use deliver_now instead of deliver_later"
      else
        puts "✓ Queue is healthy!"
      end

      if failed_jobs > 0
        puts
        puts "Failed jobs (last 5):"
        SolidQueue::FailedExecution.order(created_at: :desc).limit(5).each do |failure|
          puts "  - #{failure.job.class_name}: #{failure.error&.first(100)}"
        end
      end

    rescue => e
      puts "✗ Error checking queue: #{e.message}"
      puts "Make sure solid_queue is configured and database is migrated."
    end

    puts
    puts "=" * 80
  end

  desc "Clear all pending jobs (use with caution!)"
  task clear_pending: :environment do
    pending_count = SolidQueue::Job.where(finished_at: nil).count

    print "Are you sure you want to clear #{pending_count} pending jobs? [y/N] "
    confirmation = STDIN.gets.chomp

    if confirmation.downcase == "y"
      SolidQueue::Job.where(finished_at: nil).delete_all
      puts "✓ Cleared #{pending_count} pending jobs"
    else
      puts "Cancelled"
    end
  end
end
