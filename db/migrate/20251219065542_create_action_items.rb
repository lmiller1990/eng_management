class CreateActionItems < ActiveRecord::Migration[8.1]
  def change
    create_table :action_items do |t|
      t.references :meeting, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.string :title

      t.timestamps
    end
  end
end
