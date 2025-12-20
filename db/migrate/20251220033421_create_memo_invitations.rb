class CreateMemoInvitations < ActiveRecord::Migration[8.1]
  def change
    create_table :memo_invitations do |t|
      t.references :memo, null: false, foreign_key: true
      t.references :inviter, null: false, foreign_key: { to_table: :accounts }
      t.string :email, null: false
      t.string :token, null: false
      t.datetime :accepted_at
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :memo_invitations, :token, unique: true
    add_index :memo_invitations, :email
    add_index :memo_invitations, [:memo_id, :email], unique: true,
      where: "accepted_at IS NULL",
      name: "index_memo_invitations_on_memo_and_email_pending"
  end
end
