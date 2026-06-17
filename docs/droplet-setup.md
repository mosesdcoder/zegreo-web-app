# Droplet Setup Guide — Zegreo Web

Run these steps **once** on a fresh Ubuntu 22.04 DO droplet before the first deploy.

---

## 0. Create a DigitalOcean account & Container Registry

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Go to **Container Registry** in the left nav → **Create Registry**
   - **Name:** `zogreolabs`
   - **Region:** choose the same region as your droplet
   - **Plan:** Starter (free, 500 MB) is fine to start
3. Create a **Personal Access Token**: Account → API → Generate New Token
   - Scopes: **Read + Write**
   - Save it — this goes in GitHub as `DIGITALOCEAN_ACCESS_TOKEN`

---

## 1. Create the Droplet

- **Image:** Ubuntu 24.04 LTS
- **Size:** Basic, 2 vCPU / 4 GB RAM minimum
- **Region:** same region as your Container Registry
- **Auth:** Add your SSH public key

Point `zogreo.online` A-record to the droplet's IP now so DNS propagates while you set up.

---

## 2. Initial server hardening

```bash
ssh root@<droplet-ip>

# Create a deploy user (the workflow SSHs as this user)
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to the deploy user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

# Basic firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

---

## 3. Install k3s

```bash
curl -sfL https://get.k3s.io | sh -

# Wait ~30s, then verify
kubectl get nodes

# Allow deploy user and workflow to use kubectl
chmod 644 /etc/rancher/k3s/k3s.yaml
```

---

## 4. Install nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/baremetal/deploy.yaml

# Patch to bind port 80/443 directly on the node IP
kubectl patch daemonset ingress-nginx-controller \
  -n ingress-nginx \
  --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/hostNetwork","value":true}]'

kubectl get pods -n ingress-nginx
```

---

## 5. Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.0/cert-manager.yaml

# Wait for all pods to be Running
kubectl get pods -n cert-manager --watch
```

Once ready, apply the ClusterIssuer (from your repo):

```bash
kubectl apply -f k8s/clusterissuer.yaml
```

---

## 6. Authenticate the cluster with DO Container Registry

```bash
# Install doctl on the droplet
cd /tmp
wget https://github.com/digitalocean/doctl/releases/download/v1.110.0/doctl-1.110.0-linux-amd64.tar.gz
tar xf doctl-1.110.0-linux-amd64.tar.gz
mv doctl /usr/local/bin

# Authenticate with your DO Personal Access Token
doctl auth init

# Create the zegreo namespace
kubectl create namespace zegreo

# Create the imagePullSecret named exactly 'do-registry-secret' in the zegreo namespace
doctl registry kubernetes-manifest --name do-registry-secret | kubectl apply -f -
kubectl get secret do-registry-secret -n default -o yaml \
  | sed 's/namespace: default/namespace: zegreo/' \
  | kubectl apply -f -
```

---

## 7. GitHub Actions secrets

Add these in your repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO Personal Access Token (Read + Write) |
| `SSH_PRIVATE_KEY` | Private SSH key for the `deploy` user |
| `SSH_USER` | `deploy` |
| `SSH_HOST` | Droplet public IP |
| `NEXT_PUBLIC_API_URL` | e.g. `https://api.zogreo.online` |

Also create a **`production` environment** in repo → Settings → Environments.

---

## 8. First deploy

Push to `main` or trigger via **Actions → workflow_dispatch**. The workflow:

1. Builds the Next.js Docker image
2. Pushes it to `registry.digitalocean.com/zogreolabs/zegreo-web`
3. SSHs into the droplet, applies the k8s manifests, rollout restarts, and waits for success

Monitor on the droplet:

```bash
kubectl get pods -n zegreo --watch
kubectl logs -n zegreo deploy/zegreo-web
```

cert-manager issues the TLS certificate automatically on the first request. Check status with:

```bash
kubectl describe certificate -n zegreo
kubectl get certificaterequest -n zegreo
```
