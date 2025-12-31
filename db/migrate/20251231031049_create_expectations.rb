class CreateExpectations < ActiveRecord::Migration[8.1]
  def change
    create_table :expectations do |t|
      t.text :description
      t.references :dimension, null: false, foreign_key: true
      t.references :role_level, null: false, foreign_key: true

      t.timestamps
    end
  end
end
