class MemoEditor < ApplicationRecord
  belongs_to :memo
  belongs_to :account

  validates :account_id, uniqueness: {
                           scope: :memo_id,
                           message: "is already an editor of this memo",
                         }
end
