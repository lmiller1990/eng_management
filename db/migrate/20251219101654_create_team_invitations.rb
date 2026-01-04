class CreateTeamInvitations < ActiveRecord::Migration[8.1]
  def change
    create_table :team_invitations do |t|
      t.references :team, null: false, foreign_key: true
      t.references :inviter, null: false, foreign_key: { to_table: :accounts }
      t.citext :email, null: false
      t.string :token, null: false
      t.datetime :accepted_at
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :team_invitations, :token, unique: true
    add_index :team_invitations, [:team_id, :email], unique: true, where: "accepted_at IS NULL"
    add_index :team_invitations, :email
  end
end
