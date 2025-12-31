class CreateDimensions < ActiveRecord::Migration[8.1]
  def change
    create_table :dimensions do |t|
      t.string :name
      t.references :competency, null: false, foreign_key: true

      t.timestamps
    end
  end
end
