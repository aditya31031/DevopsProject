#!/bin/bash
# Health Check Script

API_URL="${API_URL:-http://localhost:5000}"
MAX_RETRIES=5
RETRY_INTERVAL=5

echo "🏥 Running health check against ${API_URL}"

for i in $(seq 1 $MAX_RETRIES); do
  RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/health")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ API is healthy!"
    echo "Response: $BODY"
    exit 0
  fi

  echo "⚠️  Attempt $i/$MAX_RETRIES failed (HTTP $HTTP_CODE). Retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
