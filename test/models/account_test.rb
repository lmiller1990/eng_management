require "test_helper"

class AccountTest < ActiveSupport::TestCase
  test "derive_name with standard dot-separated email" do
    account = accounts(:one)
    account.email = "john.doe@example.com"

    result = account.derive_name

    assert_equal "John", result.first_name
    assert_equal "Doe", result.last_name
    assert_equal "JD", result.initials
    assert_equal "John Doe", result.full_name
  end

  test "derive_name with underscore-separated email" do
    account = accounts(:one)
    account.email = "jane_smith@example.com"

    result = account.derive_name

    assert_equal "Jane", result.first_name
    assert_equal "Smith", result.last_name
    assert_equal "JS", result.initials
  end

  test "derive_name with single name (no separator)" do
    account = accounts(:one)
    account.email = "freddie@queen.com"

    result = account.derive_name

    assert_equal "Freddie", result.first_name
    assert_equal "", result.last_name
    assert_equal "F", result.initials
    assert_equal "Freddie", result.full_name
  end

  test "derive_name with multiple dots uses first and last" do
    account = accounts(:one)
    account.email = "j.d.smith@example.com"

    result = account.derive_name

    assert_equal "J", result.first_name
    assert_equal "Smith", result.last_name
    assert_equal "JS", result.initials
  end

  test "derive_name with custom derivation function" do
    account = accounts(:one)
    account.email = "john.doe@example.com"

    # Custom function that reverses the logic
    custom_fn = lambda do |email|
      local = email.split('@').first
      parts = local.split('.')
      {
        first_name: parts.last&.capitalize || "",
        last_name: parts.first&.capitalize || "",
        initials: "X"
      }
    end

    result = account.derive_name(custom_fn)

    assert_equal "Doe", result.first_name
    assert_equal "John", result.last_name
    assert_equal "X", result.initials
  end

  test "derive_name handles emails with numbers" do
    account = accounts(:one)
    account.email = "john.doe123@example.com"

    result = account.derive_name

    assert_equal "John", result.first_name
    assert_equal "Doe123", result.last_name
    assert_equal "JD", result.initials
  end

  test "derive_name handles all caps email" do
    account = accounts(:one)
    account.email = "JOHN.DOE@EXAMPLE.COM"

    result = account.derive_name

    # Should still capitalize properly
    assert_equal "John", result.first_name
    assert_equal "Doe", result.last_name
    assert_equal "JD", result.initials
  end

  test "derive_name with custom function that returns nil values" do
    account = accounts(:one)
    account.email = "test@example.com"

    # Malformed custom function that might return nils
    bad_fn = lambda do |email|
      { first_name: nil, last_name: nil, initials: nil }
    end

    result = account.derive_name(bad_fn)

    # Should handle gracefully by converting to strings
    assert_equal "", result.first_name
    assert_equal "", result.last_name
    assert_equal "", result.initials
  end
end
