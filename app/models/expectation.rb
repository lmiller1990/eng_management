class Expectation < ApplicationRecord
  validates :description, presence: true
  belongs_to :dimension
  belongs_to :job_title
end
