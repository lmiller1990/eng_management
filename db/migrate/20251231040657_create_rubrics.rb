class CreateRubrics < ActiveRecord::Migration[8.1]
  def change
    create_table :rubrics do |t|
      t.text :name, null: false
      t.text :description

      t.timestamps
    end
  end
end
