class HeartbeatController < ActionController::Base
  def ping
    render json: { status: "ok", timestamp: Time.current }
  end
end
