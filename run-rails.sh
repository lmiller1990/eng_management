docker run --rm \
  --name eng_management \
  --network eng_net \
  -e DATABASE_URL \
  -e SECRET_KEY_BASE \
  eng_management \
  bundle exec rails db:prepare
