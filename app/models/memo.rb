class Memo < ApplicationRecord
  # Owner relationship
  belongs_to :owner, class_name: 'Account', foreign_key: 'account_id'

  # Editors relationship (many-to-many)
  has_many :memo_editors, dependent: :destroy
  has_many :editors, through: :memo_editors, source: :account
end
