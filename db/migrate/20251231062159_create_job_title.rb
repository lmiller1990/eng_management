class CreateJobTitle < ActiveRecord::Migration[8.1]
  def change
    create_table :job_titles do |t|
      t.text :name

      t.timestamps
    end
  end
end
