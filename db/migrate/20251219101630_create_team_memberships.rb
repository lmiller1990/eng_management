class CreateTeamMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :team_memberships do |t|
      t.references :team, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.string :role, null: false, default: 'member'

      t.timestamps
    end

    add_index :team_memberships, [ :team_id, :account_id ], unique: true
  end
end
