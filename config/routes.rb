Rails.application.routes.draw do
  # Public routes
  root "home#index"

  get "heartbeat/ping", to: "heartbeat#ping"
  get "up" => "rails/health#show", as: :rails_health_check

  # Error pages
  match "/404", to: "errors#not_found", via: :all
  match "/422", to: "errors#unprocessable_entity", via: :all
  match "/500", to: "errors#internal_server_error", via: :all

  # Public invitation acceptance routes (no auth required)
  get "/invitations/:token/accept", to: "team_invitations#accept", as: :accept_team_invitation
  get "/invitations/:token/setup-password", to: "team_invitations#setup_password", as: :setup_password_team_invitation
  post "/invitations/:token/complete-setup", to: "team_invitations#complete_setup", as: :complete_setup_team_invitation

  # Public memo invitation acceptance routes (no auth required)
  get "/memo-invitations/:token/accept", to: "memo_invitations#accept", as: :accept_memo_invitation
  get "/memo-invitations/:token/setup-password", to: "memo_invitations#setup_password", as: :setup_password_memo_invitation
  post "/memo-invitations/:token/complete-setup", to: "memo_invitations#complete_setup", as: :complete_setup_memo_invitation

  # Authenticated app routes under /app
  scope path: "/app" do
    resources :memos do
      resources :invitations, controller: "memo_invitations", only: [:create, :destroy]
    end
    resources :team, only: [:index]

    resources :teams do
      resources :memberships, controller: "team_memberships", only: [:destroy]
      resources :invitations, controller: "team_invitations", only: [:create, :destroy]
      resources :members, only: [:show], controller: "team_members"
    end

    resources :rubrics, only: [:new, :create, :show, :edit, :index]

    # Dimension scores for modal form
    resources :dimension_scores, only: [:new, :create]

    resources :accounts, only: [:index, :show] do
      resources :rubric_evaluations, only: [:new, :create, :index, :edit] do
      end
    end

    resources :meetings do
      resources :notes, only: [:index, :new, :create, :edit, :update, :destroy]
      resources :action_items, only: [:index, :new, :create, :edit, :update, :destroy]
      resources :participants, controller: "meeting_participants", only: [:create, :destroy]
    end

    resources :debug, only: [:index]
  end

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
