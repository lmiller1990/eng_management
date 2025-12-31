class CompetencyProfile < ApplicationRecord
  belongs_to :account
  belongs_to :role_level
end
