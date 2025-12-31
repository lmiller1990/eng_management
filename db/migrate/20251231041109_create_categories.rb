class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.timestamps

      t.references :rubric, null: false, foreign_key: true
      t.text :name, null: false
    end
  end
end
