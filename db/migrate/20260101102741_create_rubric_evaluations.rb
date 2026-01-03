class CreateRubricEvaluations < ActiveRecord::Migration[8.1]
  def change
    create_table :rubric_evaluations do |t|
      t.integer :account_id, null: false
      t.integer :rubric_id, null: false

      t.foreign_key :accounts, column: :account_id
      t.foreign_key :rubrics

      t.timestamps
    end

    create_table :dimension_scores do |t|
      t.integer :rubric_evaluation_id, null: false
      t.integer :dimension_id, null: false
      t.integer :score, null: false
      t.text :notes

      t.foreign_key :rubric_evaluations
      t.foreign_key :dimensions

      t.timestamps
    end
  end
end
