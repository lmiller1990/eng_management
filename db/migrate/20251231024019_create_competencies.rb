class CreateCompetencies < ActiveRecord::Migration[8.1]
  def change
    create_table :competencies do |t|
      t.string :name

      t.timestamps
    end
  end
end
