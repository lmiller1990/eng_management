class CreateCompetencyProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :competency_profiles do |t|
      t.references :account, null: false, foreign_key: true
      t.references :role_level, null: false, foreign_key: true

      t.timestamps
    end
  end
end
