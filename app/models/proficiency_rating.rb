class ProficiencyRating < ApplicationRecord
  belongs_to :competency_profile
  belongs_to :dimension
end
