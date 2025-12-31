class CreateDimension < ActiveRecord::Migration[8.1]
  def change
    create_table :dimensions do |t|
      t.text :name, null: false
      t.references :rubric, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end

    add_index :dimensions, [ :rubric_id, :category_id, :name ],
          unique: true,
          name: 'index_dimensions_on_rubric_category_name'
  end
end
