#!/bin/bash

# Upload JaCoCo coverage to Codecov for Researchers Page - Conicet

set -e  # exit immediately if a command exits with a non-zero status

# Configuration
CODECOV_TOKEN="e56403a5-4d3d-4ef6-8f72-d9f92675e468"
CODECOV_SLUG="lminervino18/researchers-page-conicet"
COVERAGE_FILE="backend/target/site/jacoco/jacoco.xml"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "🚀 Running tests and generating coverage..."
mvn clean verify
cd ..

# Download Codecov uploader if it's not present
if [ ! -f "./codecov" ]; then
  echo "⬇️ Downloading Codecov uploader..."
  curl -Os https://uploader.codecov.io/latest/linux/codecov
  chmod +x codecov
fi

echo "📤 Uploading coverage report to Codecov..."
./codecov \
  --token "$CODECOV_TOKEN" \
  --file "$COVERAGE_FILE" \
  --slug "$CODECOV_SLUG" \
  --branch "$BRANCH"

echo "✅ Done. Visit your dashboard at https://codecov.io/gh/$CODECOV_SLUG"
