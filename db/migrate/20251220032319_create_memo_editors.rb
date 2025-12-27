class CreateMemoEditors < ActiveRecord::Migration[8.1]
  def change
    create_table :memo_editors do |t|
      t.references :memo, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true

      t.timestamps
    end

    add_index :memo_editors, [ :memo_id, :account_id ], unique: true
  end
end
