class CreateExpectation < ActiveRecord::Migration[8.1]
  def change
    create_table :expectations do |t|
      t.text :description, null: false

      t.references :dimension, null: false, foreign_key: true
      t.references :job_title, null: false, foreign_key: true

      t.timestamps
    end

    add_index :expectations, [:dimension_id, :job_title_id], unique: true
  end
end
