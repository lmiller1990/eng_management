# frozen_string_literal: true

class MemoPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    # Owner or editor can view the memo
    owner? || editor?
  end

  def create?
    # Any authenticated account can create a memo
    true
  end

  def update?
    # Only owner or editor can update
    owner? || editor?
  end

  def destroy?
    # Only owner can delete
    owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      # Return memos that the account owns or can edit
      scope.left_joins(:memo_editors)
           .where("memos.account_id = ? OR memo_editors.account_id = ?", account.id, account.id)
           .distinct
    end
  end

  private

  def owner?
    record.owner == account
  end

  def editor?
    record.editors.include?(account)
  end
end
