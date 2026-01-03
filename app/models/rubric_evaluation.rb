class RubricEvaluation < ApplicationRecord
  belongs_to :account
  belongs_to :rubric

  has_many :dimension_scores, dependent: :destroy
  has_many :dimensions, through: :dimension_scores
end
