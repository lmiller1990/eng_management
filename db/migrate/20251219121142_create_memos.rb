class CreateMemos < ActiveRecord::Migration[8.1]
  def change
    create_table :memos do |t|
      t.string :title
      t.text :content
      t.references :account, null: false, foreign_key: true

      t.timestamps
    end
  end
end
