require "test_helper"

class RubricTest < ActiveSupport::TestCase
  test "get associated job titles via dimensions and expectations" do
    eng = Rubric.find_by!(name: "Engineering")
    assert eng.job_titles.count == 2
    assert eng.job_titles.first.name == "Junior Engineer"
    assert eng.job_titles.second.name == "Senior Engineer"
  end
end
