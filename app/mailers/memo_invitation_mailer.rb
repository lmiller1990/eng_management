class MemoInvitationMailer < ApplicationMailer
  def invite_to_edit(invitation)
    @invitation = invitation
    @memo = invitation.memo
    @inviter = invitation.inviter
    @accept_url = accept_memo_invitation_url(token: invitation.token)

    mail(
      to: invitation.email,
      subject: "#{@inviter.email} invited you to edit a memo"
    )
  end
end
