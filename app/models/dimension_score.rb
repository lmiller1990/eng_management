class DimensionScore < ApplicationRecord
  enum :score, {
outstanding:	5,
advanced_level:	4,
competent_level:	3,
developing_level:	2,
not_attempting:	1,
not_applicable: 0
  }
end
