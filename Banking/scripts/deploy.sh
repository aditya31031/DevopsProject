#!/bin/bash
# Banking App Deploy Script

set -euo pipefail

# ─── Config ─────────────────────────────────────────────
IMAGE_NAME="banking-api"
REGISTRY="${DOCKER_USERNAME:-yourdockerhub}"
TAG="${1:-latest}"
NAMESPACE="banking"

echo "🚀 Deploying Banking App — tag: ${TAG}"
echo "════════════════════════════════════════"

# Build backend image
echo "📦 Building backend image..."
docker build -t "${REGISTRY}/${IMAGE_NAME}:${TAG}" --target production .

# Build frontend image
echo "📦 Building frontend image..."
docker build -t "${REGISTRY}/banking-frontend:${TAG}" ./client

# Push images
echo "⬆️  Pushing images to registry..."
docker push "${REGISTRY}/${IMAGE_NAME}:${TAG}"
docker push "${REGISTRY}/banking-frontend:${TAG}"

# Apply K8s manifests
echo "☸️  Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Update image in deployment
echo "🔄 Rolling out new image..."
kubectl set image deployment/banking-backend \
  banking-backend="${REGISTRY}/${IMAGE_NAME}:${TAG}" \
  -n "${NAMESPACE}"

kubectl rollout status deployment/banking-backend \
  -n "${NAMESPACE}" --timeout=120s

# Health check post deploy
echo "🏥 Running health check..."
sleep 5
kubectl get pods -n "${NAMESPACE}"

echo ""
echo "✅ Deployment complete! Backend: ${REGISTRY}/${IMAGE_NAME}:${TAG}"
