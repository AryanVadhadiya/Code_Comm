#!/usr/bin/env bash
set -euo pipefail

# Simple helper to trigger Render deploys using the Render API.
# Requires environment variables:
# - RENDER_API_KEY
# - BACKEND_SERVICE_ID (optional)
# - FRONTEND_SERVICE_ID (optional)

if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "ERROR: RENDER_API_KEY is not set"
  exit 1
fi

if [ -n "${BACKEND_SERVICE_ID:-}" ]; then
  echo "Triggering backend deploy for service: ${BACKEND_SERVICE_ID}"
  curl -sS -X POST "https://api.render.com/v1/services/${BACKEND_SERVICE_ID}/deploys" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":false}' || true
  echo -e "\nBackend deploy triggered.\n"
fi

if [ -n "${FRONTEND_SERVICE_ID:-}" ]; then
  echo "Triggering frontend deploy for service: ${FRONTEND_SERVICE_ID}"
  curl -sS -X POST "https://api.render.com/v1/services/${FRONTEND_SERVICE_ID}/deploys" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":false}' || true
  echo -e "\nFrontend deploy triggered.\n"
fi

if [ -z "${BACKEND_SERVICE_ID:-}" ] && [ -z "${FRONTEND_SERVICE_ID:-}" ]; then
  echo "No service ids provided. Set BACKEND_SERVICE_ID and/or FRONTEND_SERVICE_ID."
  exit 1
fi

echo "Done. Check Render dashboard for deploy status and logs."
