class AddYjsStateToMemos < ActiveRecord::Migration[8.1]
  def change
    add_column :memos, :yjs_state, :binary
  end
end
