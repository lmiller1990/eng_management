class RodauthApp < Rodauth::Rails::App
  # primary configuration
  configure RodauthMain

  # secondary configuration
  # configure RodauthAdmin, :admin

  route do |r|
    rodauth.load_memory rescue nil # autologin remembered users

    r.rodauth # route rodauth requests


    r.is "become", :id do |id|
      # Require authentication and admin privileges
      rodauth.require_account
      if not rodauth.account[:admin]
        r.redirect("/")
      end

      # Perform your account lookup.
      account = Account.find(id.to_i)

      # Switch accounts using the become_account feature.
      rodauth.become_account(account)

      # Set flash message and redirect
      flash[:notice] = "You've successfully became #{account.email}"
      r.redirect("/")
    end

    # ==> Authenticating requests
    # Call `rodauth.require_account` for requests that you want to
    # require authentication for. For example:
    #
    # # authenticate /dashboard/* and /account/* requests
    # if r.path.start_with?("/dashboard") || r.path.start_with?("/account")
    #   rodauth.require_account
    # end

    # ==> Secondary configurations
    # r.rodauth(:admin) # route admin rodauth requests
  end
end
