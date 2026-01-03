class Rubric < ApplicationRecord
  validates :name, presence: true

  has_many :categories, dependent: :destroy

  has_many :dimensions
  has_many :expectations, through: :dimensions
  has_many :job_titles, -> { distinct }, through: :expectations
end
