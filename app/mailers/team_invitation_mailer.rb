class TeamInvitationMailer < ApplicationMailer
  def invite_to_team(invitation)
    @invitation = invitation
    @team = invitation.team
    @inviter = invitation.inviter
    @accept_url = accept_team_invitation_url(token: invitation.token)

    mail(
      to: @invitation.email,
      subject: "#{@inviter.email} invited you to join #{@team.name}",
    )
  end
end
