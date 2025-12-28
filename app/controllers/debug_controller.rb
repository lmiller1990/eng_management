class DebugController < ApplicationController
  def index
    @commit = ENV["GIT_COMMIT"] || "unknown"
    @message = ENV["GIT_MESSAGE"] || "unknown"
    render plain: "Commit: #{@commit}\nMessage: #{@message}"
  end
end
