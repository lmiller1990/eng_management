class AddOrderToJobTitle < ActiveRecord::Migration[8.1]
    class JobTitle < ApplicationRecord
      self.table_name = "job_titles"
    end

  def change
    add_column :job_titles, :order, :integer, default: 0

    JobTitle.find_by!(name: "Junior Engineer").update(order: 0)
    JobTitle.find_by!(name: "Intermediate Engineer").update(order: 1)
    JobTitle.find_by!(name: "Senior Engineer").update(order: 2)
    JobTitle.find_by!(name: "Tech Lead").update(order: 3)
    JobTitle.find_by!(name: "Principal Engineer").update(order: 4)
    JobTitle.find_by!(name: "Engineer Manager").update(order: 5)
  end
end
