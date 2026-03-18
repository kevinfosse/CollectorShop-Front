#!/usr/bin/env bash
# GitHub Actions Self-Hosted Runner Setup Script
# Run this on your Azure VM to set up the runner

set -e

RUNNER_VERSION="2.320.0"
RUNNER_HOME="/home/actions-runner"
GITHUB_ORG="MAALSI-CUBE3"
REPO_BACK="CollectorShop-Back"
REPO_FRONT="CollectorShop"

echo "=================================="
echo "GitHub Actions Self-Hosted Runner Setup"
echo "=================================="

# 1. Create runner user and directory
echo "[1/7] Creating runner user and directories..."
sudo useradd -m -s /bin/bash actions-runner 2>/dev/null || echo "  User 'actions-runner' already exists"
sudo mkdir -p "$RUNNER_HOME"
sudo chown -R actions-runner:actions-runner "$RUNNER_HOME"

# 2. Install dependencies
echo "[2/7] Installing dependencies..."
sudo apt-get update -qq
sudo apt-get install -qq -y curl jq unzip

# 3. Download and extract runner
echo "[3/7] Downloading GitHub Actions Runner v${RUNNER_VERSION}..."
cd "$RUNNER_HOME"
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
sudo -u actions-runner curl -s -L -o runner.tar.gz "$RUNNER_URL"
sudo -u actions-runner tar xzf runner.tar.gz
sudo rm runner.tar.gz

# 4. Create runner configuration script
echo "[4/7] Creating runner configuration..."
cat > /tmp/configure-runner.sh << 'RUNNER_SCRIPT'
#!/bin/bash
set -e

RUNNER_HOME="/home/actions-runner"
GITHUB_ORG="MAALSI-CUBE3"

# Function to configure runner for a repository
configure_repo() {
    local repo=$1
    local token=$2
    local runner_name="${repo}-runner"

    echo "  Configuring runner for $repo..."
    mkdir -p "$RUNNER_HOME/$runner_name"
    cd "$RUNNER_HOME/$runner_name"

    # Unpack runner files if not already done
    if [ ! -f "config.sh" ]; then
        cp -r "$RUNNER_HOME"/{bin,externals,lib,run.sh,config.sh} .
    fi

    # Configure runner
    ./config.sh \
        --url "https://github.com/$GITHUB_ORG/$repo" \
        --token "$token" \
        --name "$runner_name" \
        --runnergroup "Default" \
        --labels "self-hosted,linux,x64,docker,k8s" \
        --work "_work" \
        --replace \
        --unattended

    chown -R actions-runner:actions-runner "$RUNNER_HOME/$runner_name"
}

echo "================================"
echo "Configuring runners..."
echo "================================"

# You need to provide registration tokens from GitHub
# Get them from: https://github.com/organizations/MAALSI-CUBE3/settings/actions/runners/new

if [ -z "$RUNNER_TOKEN_BACK" ] || [ -z "$RUNNER_TOKEN_FRONT" ]; then
    echo "ERROR: Please set RUNNER_TOKEN_BACK and RUNNER_TOKEN_FRONT environment variables"
    echo ""
    echo "To get registration tokens:"
    echo "1. Go to: https://github.com/organizations/MAALSI-CUBE3/settings/actions/runners/new"
    echo "2. Select Linux x64"
    echo "3. Copy the registration token and export it:"
    echo "   export RUNNER_TOKEN_BACK='<token-for-back>'"
    echo "   export RUNNER_TOKEN_FRONT='<token-for-front>'"
    echo "4. Run this script again"
    exit 1
fi

configure_repo "CollectorShop-Back" "$RUNNER_TOKEN_BACK"
configure_repo "CollectorShop" "$RUNNER_TOKEN_FRONT"

echo ""
echo "Runners configured successfully!"
RUNNER_SCRIPT

chmod +x /tmp/configure-runner.sh
echo "  ✓ Configuration script created"

# 5. Install Runner as Service
echo "[5/7] Installing runners as systemd services..."
cd "$RUNNER_HOME"

# Create systemd service files
cat | sudo tee /etc/systemd/system/actions-runner-back.service > /dev/null << 'SYSTEMD_BACK'
[Unit]
Description=GitHub Actions Runner - CollectorShop-Back
After=network.target

[Service]
Type=simple
User=actions-runner
WorkingDirectory=/home/actions-runner/CollectorShop-Back-runner
ExecStart=/home/actions-runner/CollectorShop-Back-runner/run.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SYSTEMD_BACK

cat | sudo tee /etc/systemd/system/actions-runner-front.service > /dev/null << 'SYSTEMD_FRONT'
[Unit]
Description=GitHub Actions Runner - CollectorShop
After=network.target

[Service]
Type=simple
User=actions-runner
WorkingDirectory=/home/actions-runner/CollectorShop-runner
ExecStart=/home/actions-runner/CollectorShop-runner/run.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SYSTEMD_FRONT

sudo systemctl daemon-reload
echo "  ✓ Systemd services created"

# 6. Verify Docker and kubectl
echo "[6/7] Verifying Docker and kubectl..."
if ! command -v docker &> /dev/null; then
    echo "  ⚠ Docker not found. Make sure it's installed and running."
else
    echo "  ✓ Docker: $(docker --version)"
fi

if ! command -v kubectl &> /dev/null; then
    echo "  ⚠ kubectl not found. Make sure it's installed."
else
    echo "  ✓ kubectl: $(kubectl version --client --short 2>/dev/null || echo 'installed')"
fi

# 7. Summary
echo "[7/7] Setup complete!"
echo ""
echo "================================"
echo "Next Steps:"
echo "================================"
echo ""
echo "1. Get registration tokens from GitHub:"
echo "   Backend:  https://github.com/organizations/MAALSI-CUBE3/settings/actions/runners/new"
echo "   Frontend: https://github.com/organizations/MAALSI-CUBE3/settings/actions/runners/new"
echo ""
echo "2. Set environment variables:"
echo "   export RUNNER_TOKEN_BACK='<your-token-1>'"
echo "   export RUNNER_TOKEN_FRONT='<your-token-2>'"
echo ""
echo "3. Configure runners:"
echo "   sudo /tmp/configure-runner.sh"
echo ""
echo "4. Start the runners:"
echo "   sudo systemctl start actions-runner-back"
echo "   sudo systemctl start actions-runner-front"
echo ""
echo "5. Enable auto-start (optional):"
echo "   sudo systemctl enable actions-runner-back"
echo "   sudo systemctl enable actions-runner-front"
echo ""
echo "6. Check status:"
echo "   sudo systemctl status actions-runner-back"
echo "   sudo systemctl status actions-runner-front"
echo ""
