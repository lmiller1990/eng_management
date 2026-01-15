class ErrorsController < ApplicationController
  skip_before_action :authenticate, only: [:not_found, :unprocessable_entity, :internal_server_error]
  layout false

  def not_found
    @request_id = request.request_id
    render status: :not_found
  end

  def unprocessable_entity
    @request_id = request.request_id
    render status: :unprocessable_entity
  end

  def internal_server_error
    @request_id = request.request_id
    render status: :internal_server_error
  end
end
