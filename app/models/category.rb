class Category < ApplicationRecord
  validates :name, presence: true

  belongs_to :rubric
  has_many :dimensions
  belongs_to :rubric
end
