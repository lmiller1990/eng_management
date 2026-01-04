class MakeScoreHaveDefault < ActiveRecord::Migration[8.1]
  def up
    execute "UPDATE dimension_scores SET score = 0 WHERE score IS NULL"
    change_column_default :dimension_scores, :score, 0
    change_column_null :dimension_scores, :score, false
  end

  def down
    change_column_null :dimension_scores, :score, true
    change_column_default :dimension_scores, :score, nil
  end
end
