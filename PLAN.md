# CI/CD Pipeline Architecture Plan

## Architecture Decision: Pragmatic Hybrid (No k3s)

After analyzing the constraints, **k3s + ArgoCD is NOT recommended** for this setup:

| Factor           | k3s + ArgoCD                                                            | Docker Compose + SSH Deploy                     |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| RAM overhead     | ~2-3 GB (k3s + ArgoCD + Prometheus + Grafana)                           | ~300 MB (Prometheus + Grafana as containers)    |
| Complexity       | High — ArgoCD can't natively manage Docker Compose, needs custom bridge | Low — GitLab CI SSHs in and runs docker compose |
| Disk overhead    | ~3-5 GB (k3s images, etcd, ArgoCD)                                      | ~200 MB                                         |
| Traefik conflict | k3s ships its own Traefik, must disable and configure                   | None — reuses existing Traefik                  |
| Benefit          | True GitOps reconciliation loop                                         | Direct deployment, still version-controlled     |
| PORT conflicts   | k3s uses 6443, conflicts possible                                       | None                                            |

**Verdict**: Since apps stay in Docker Compose, ArgoCD adds complexity with zero benefit. The "GitOps" spirit is preserved by having all config in Git and deploying via CI pipeline.

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitLab.com (SaaS)                         │
│                                                              │
│  CollectorShop-Front repo    CollectorShop-Back repo         │
│  ┌────────────────────┐     ┌────────────────────┐          │
│  │ .gitlab-ci.yml     │     │ .gitlab-ci.yml     │          │
│  │                    │     │                    │          │
│  │ 1. lint (ESLint)   │     │ 1. lint (dotnet)   │          │
│  │ 2. build           │     │ 2. build           │          │
│  │ 3. test (Vitest)   │     │ 3. test (xUnit)    │          │
│  │ 4. security (audit)│     │ 4. security (vuln) │          │
│  │ 5. sonar (Cloud)   │     │ 5. sonar (Cloud)   │          │
│  │ 6. docker+trivy    │     │ 6. docker+trivy    │          │
│  │ 7. deploy (SSH)    │     │ 7. deploy (SSH)    │          │
│  └────────┬───────────┘     └────────┬───────────┘          │
│           │                          │                      │
│  GitLab Container Registry           │                      │
│  registry.gitlab.com/maalsi-cube3/   │                      │
│    CollectorShop-Front:latest        │                      │
│    CollectorShop-Front:<sha>         │                      │
│    CollectorShop-Back:latest         │                      │
│    CollectorShop-Back:<sha>          │                      │
└───────────┬──────────────────────────┘──────────────────────┘
            │ SSH deploy (pull + restart)
            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Azure VM (maalsikube.dev)                     │
│                                                              │
│  Docker Compose Stack:                                       │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐                │
│  │ Traefik  │ │ Frontend   │ │ Backend    │                │
│  │ (proxy)  │ │ (nginx)    │ │ (.NET 9)   │                │
│  └──────────┘ └────────────┘ └────────────┘                │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐                │
│  │ MSSQL    │ │ CloudBeaver│ │ Uptime Kuma│                │
│  └──────────┘ └────────────┘ └────────────┘                │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐                │
│  │Portainer │ │ Prometheus │ │  Grafana   │                │
│  └──────────┘ └────────────┘ └────────────┘                │
│  ┌──────────┐                                               │
│  │WireGuard │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: GitLab Container Registry Setup

- Enable GitLab Container Registry on both repos (Settings → Packages & Registries)
- Create a GitLab Deploy Token for the VM to pull images
- Store token on VM for `docker login registry.gitlab.com`

### Phase 2: SSH Deploy Key

- Generate an SSH key pair on the VM
- Add the public key to GitLab CI/CD variables as `SSH_PRIVATE_KEY` (masked, file type)
- Add VM host key to `SSH_KNOWN_HOSTS` variable
- The deploy stage SSHs into the VM and runs: `docker compose pull && docker compose up -d`

### Phase 3: New .gitlab-ci.yml (Frontend)

```yaml
stages:
  - lint
  - build
  - test
  - security
  - sonar
  - docker
  - deploy

variables:
  NODE_VERSION: '22'
  IMAGE_NAME: $CI_REGISTRY_IMAGE
  IMAGE_TAG: $CI_COMMIT_SHORT_SHA

default:
  image: node:22-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - .angular/cache/
  before_script:
    - npm ci

# ── Stage 1: Lint ──
lint:
  stage: lint
  script:
    - npx ng lint
  allow_failure: false

# ── Stage 2: Build ──
build:
  stage: build
  script:
    - npx ng build --configuration=production
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

# ── Stage 3: Test ──
test:
  stage: test
  script:
    - npx ng test --watch=false --coverage
  coverage: '/Statements\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    when: always
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  allow_failure: false

# ── Stage 4: Security ──
security:audit:
  stage: security
  script:
    - npm audit --audit-level=high || true
    - npm audit --audit-level=critical
  allow_failure: false

# ── Stage 5: SonarCloud ──
sonar:
  stage: sonar
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: '${CI_PROJECT_DIR}/.sonar'
    GIT_DEPTH: '0'
  cache:
    key: sonar-cache
    paths:
      - .sonar/cache
  before_script: []
  script:
    - sonar-scanner
      -Dsonar.projectKey="maalsi-cube3_CollectorShop-Front"
      -Dsonar.organization="maalsi-cube3"
      -Dsonar.token="${SONAR_TOKEN}"
      -Dsonar.host.url="https://sonarcloud.io"
      -Dsonar.sources="src"
      -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/*.spec.ts"
      -Dsonar.qualitygate.wait=true
  only:
    - master
    - merge_requests
  allow_failure: false

# ── Stage 6: Docker Build + Push + Trivy Scan ──
docker:build:
  stage: docker
  image: docker:27
  services:
    - docker:27-dind
  variables:
    DOCKER_TLS_CERTDIR: '/certs'
  before_script: []
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .
    - docker push $IMAGE_NAME:$IMAGE_TAG
    - docker push $IMAGE_NAME:latest
  only:
    - master
    - tags

trivy:scan:
  stage: docker
  image:
    name: aquasec/trivy:latest
    entrypoint: ['']
  needs:
    - docker:build
  before_script: []
  script:
    - trivy image --exit-code 1 --severity CRITICAL
      --username $CI_REGISTRY_USER --password $CI_REGISTRY_PASSWORD
      $IMAGE_NAME:$IMAGE_TAG
  allow_failure: false
  only:
    - master
    - tags

# ── Stage 7: Deploy to VM ──
deploy:production:
  stage: deploy
  image: alpine:latest
  needs:
    - docker:build
    - trivy:scan
  before_script: []
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" >> ~/.ssh/known_hosts
    - |
      ssh $SSH_USER@$SSH_HOST "
        docker login -u '$CI_REGISTRY_USER' -p '$CI_REGISTRY_PASSWORD' $CI_REGISTRY &&
        cd /opt/services/apps &&
        docker compose pull collectorshop-front &&
        docker compose up -d collectorshop-front &&
        docker image prune -f
      "
  environment:
    name: production
    url: https://maalsikube.dev
  only:
    - master
  when: manual
```

### Phase 4: New .gitlab-ci.yml (Backend)

Same structure but with .NET stages:

- lint: `dotnet format --verify-no-changes`
- build: `dotnet build -c Release`
- test: `dotnet test` with coverage
- security: `dotnet list package --vulnerable`
- sonar: `dotnet-sonarscanner` with SonarCloud
- docker: Build + push to GitLab Registry
- trivy: Scan the image
- deploy: SSH pull + restart collectorshop-back

### Phase 5: Update Docker Compose (apps)

Change from `build:` to `image:` to pull pre-built images from GitLab Registry:

```yaml
collectorshop-front:
  image: registry.gitlab.com/maalsi-cube3/collectorshop-front:latest
  # remove build: section
  ...

collectorshop-back:
  image: registry.gitlab.com/maalsi-cube3/collectorshop-back:latest
  # remove build: section
  ...
```

### Phase 6: Monitoring (Prometheus + Grafana)

Add as Docker Compose services (~300MB RAM total):

- Prometheus scrapes: Traefik metrics, Node Exporter, cAdvisor
- Grafana at `https://grafana.maalsikube.dev`
- Pre-configured dashboards for Docker containers and Traefik

### Phase 7: Notifications

- GitLab CI: Add `after_script` webhook to Slack/Discord/email
- Or use GitLab's built-in Slack integration (Settings → Integrations)

---

## GitLab CI/CD Variables Required

| Variable          | Scope                     | Description               |
| ----------------- | ------------------------- | ------------------------- |
| `SSH_PRIVATE_KEY` | Both repos (masked, file) | Deploy key to SSH into VM |
| `SSH_KNOWN_HOSTS` | Both repos                | VM host key fingerprint   |
| `SSH_USER`        | Both repos                | `maalsiazurevm`           |
| `SSH_HOST`        | Both repos                | `20.199.136.208`          |
| `SONAR_TOKEN`     | Both repos (masked)       | SonarCloud auth token     |

Note: `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD` are provided automatically by GitLab.

---

## Resource Budget

| Service          | RAM         | Status                   |
| ---------------- | ----------- | ------------------------ |
| Current services | 2.1 GB      | Running                  |
| Prometheus       | ~100 MB     | New                      |
| Grafana          | ~100 MB     | New                      |
| Node Exporter    | ~20 MB      | New                      |
| cAdvisor         | ~80 MB      | New                      |
| **Total**        | **~2.4 GB** | Leaves ~5.3 GB available |

---

## What We're NOT Doing (and why)

| Skipped                   | Reason                                               |
| ------------------------- | ---------------------------------------------------- |
| k3s                       | Apps stay in Docker Compose — no benefit from ArgoCD |
| ArgoCD                    | Can't manage Docker Compose natively                 |
| Self-hosted SonarQube     | Needs 2-4GB RAM permanently                          |
| Self-hosted GitLab Runner | GitLab SaaS runners (400 min/mo free) are sufficient |
| Azure Container Registry  | GitLab Registry is free and built-in                 |
| Helm/Kustomize            | No Kubernetes = no need for manifest managers        |
