#!/usr/bin/env bash
# Provisioning initial d'un VPS Ubuntu 24.04 fresh.
# À lancer EN ROOT sur le serveur, juste après la création.
#
# Curl one-liner après push sur git :
#   curl -fsSL https://raw.githubusercontent.com/<TON_USER>/<TON_REPO>/main/scripts/init-server.sh | bash
#
# Ou copier ce fichier puis : bash init-server.sh

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Ce script doit être lancé en root (ou via sudo)."
  exit 1
fi

NEW_USER="${NEW_USER:-pairs}"
SSH_PORT="${SSH_PORT:-22}"

echo "▶ Mise à jour des paquets"
apt-get update -y
apt-get upgrade -y

echo "▶ Outils de base"
apt-get install -y curl git ufw fail2ban unattended-upgrades ca-certificates

echo "▶ Création de l'utilisateur $NEW_USER"
if ! id -u "$NEW_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$NEW_USER"
  usermod -aG sudo "$NEW_USER"
  echo "$NEW_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$NEW_USER
  # Copie la clé SSH de root pour autoriser la connexion en tant que $NEW_USER
  if [ -f /root/.ssh/authorized_keys ]; then
    mkdir -p /home/$NEW_USER/.ssh
    cp /root/.ssh/authorized_keys /home/$NEW_USER/.ssh/
    chown -R $NEW_USER:$NEW_USER /home/$NEW_USER/.ssh
    chmod 700 /home/$NEW_USER/.ssh
    chmod 600 /home/$NEW_USER/.ssh/authorized_keys
  fi
fi

echo "▶ Durcissement SSH (désactive root + password)"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl reload ssh || systemctl reload sshd

echo "▶ Firewall UFW (allow 22, 80, 443 only)"
ufw default deny incoming
ufw default allow outgoing
ufw allow "$SSH_PORT"/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp  # QUIC / HTTP3
ufw --force enable

echo "▶ Fail2ban (anti brute force SSH)"
systemctl enable --now fail2ban

echo "▶ Mises à jour de sécurité auto"
dpkg-reconfigure -plow unattended-upgrades

echo "▶ Installation de Docker (script officiel)"
curl -fsSL https://get.docker.com | sh
usermod -aG docker "$NEW_USER"
systemctl enable --now docker

echo "▶ Création du dossier app"
mkdir -p /opt/pairs
chown -R $NEW_USER:$NEW_USER /opt/pairs

echo ""
echo "✅ Serveur prêt."
echo ""
echo "Prochaines étapes (en tant que $NEW_USER) :"
echo "  ssh $NEW_USER@<ip>"
echo "  cd /opt/pairs"
echo "  git clone <ton-repo> ."
echo "  cp .env.production.example .env.production && nano .env.production"
echo "  ./scripts/deploy.sh"
