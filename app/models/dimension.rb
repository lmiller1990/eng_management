class Dimension < ApplicationRecord
  validates :name, presence: true

  belongs_to :rubric
  belongs_to :category
  has_many :expectations, dependent: :destroy
  has_many :job_titles, through: :expectations
end
