Rails.application.routes.draw do
  resources :team, only: [ :index ]

  resources :teams do
    resources :memberships, controller: "team_memberships", only: [ :destroy ]
    resources :invitations, controller: "team_invitations", only: [ :create, :destroy ]
  end

  # Public invitation acceptance route (no auth required)
  get "/invitations/:token/accept", to: "team_invitations#accept", as: :accept_team_invitation

  resources :meetings do
    resources :notes, only: [ :index, :new, :create, :edit, :update, :destroy ]
    resources :action_items, only: [ :index, :new, :create, :edit, :update, :destroy ]
    resources :participants, controller: "meeting_participants", only: [ :create, :destroy ]
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "home#index"
end
