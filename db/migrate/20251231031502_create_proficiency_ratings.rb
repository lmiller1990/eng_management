class CreateProficiencyRatings < ActiveRecord::Migration[8.1]
  def change
    create_table :proficiency_ratings do |t|
      t.integer :rating
      t.references :competency_profile, null: false, foreign_key: true
      t.references :dimension, null: false, foreign_key: true

      t.timestamps
    end
  end
end
