class AddAdminToAccounts < ActiveRecord::Migration[8.1]
  def change
    drop_table :roles, if_exists: true
    add_column :accounts, :admin, :boolean, default: false, null: false
    add_index :accounts, :admin
  end
end
