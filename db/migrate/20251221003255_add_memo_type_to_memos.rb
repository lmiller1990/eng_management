class AddMemoTypeToMemos < ActiveRecord::Migration[8.1]
  def change
    add_column :memos, :memo_type, :string, default: "shared", null: false
    add_index :memos, :memo_type
  end
end
