#!/bin/bash
set -e

VPS_IP="31.97.177.77"
VPS_USER="root"
APP_DIR="/opt/pixmemoire"

echo "=== Déploiement PixMémoire sur $VPS_IP ==="

echo "[1/5] Préparation du VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'REMOTE_SETUP'
set -e

if ! command -v docker &> /dev/null; then
    echo "Installation de Docker..."
    apt-get update -qq
    apt-get install -y -qq ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "Docker installé !"
else
    echo "Docker déjà installé."
fi

mkdir -p /opt/pixmemoire
echo "VPS prêt."
REMOTE_SETUP

echo "[2/5] Transfert des fichiers..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    -e ssh \
    ./ ${VPS_USER}@${VPS_IP}:${APP_DIR}/

echo "[3/5] Transfert du fichier .env..."
scp .env.production ${VPS_USER}@${VPS_IP}:${APP_DIR}/.env

echo "[4/5] Build et lancement des containers..."
ssh ${VPS_USER}@${VPS_IP} << REMOTE_BUILD
set -e
cd ${APP_DIR}
docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d
echo "Containers lancés !"
REMOTE_BUILD

echo "[5/5] Vérification..."
sleep 5
ssh ${VPS_USER}@${VPS_IP} "docker compose -f ${APP_DIR}/docker-compose.yml ps"

echo ""
echo "=== Déploiement terminé ! ==="
echo "Site accessible sur : http://${VPS_IP}"
