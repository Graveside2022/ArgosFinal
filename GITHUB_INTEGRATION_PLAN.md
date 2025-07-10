# GitHub Integration Plan for ArgosFinal

## Overview

This plan outlines the GitHub integration setup for the ArgosFinal RF/radio monitoring project, which combines SvelteKit frontend with Python orchestration components for HackRF and Kismet integration.

## 1. CI/CD Workflow Design

### Primary Workflow: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
    push:
        branches: [main, master, develop]
    pull_request:
        branches: [main, master]

jobs:
    # JavaScript/TypeScript Testing
    frontend-tests:
        name: Frontend Tests
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'npm'
            - run: npm ci
            - run: npm run lint
            - run: npm run format:check
            - run: npm run check
            - run: npm run test:unit
            - run: npm run test:integration
            - run: npm run build

    # Python Testing
    python-tests:
        name: Python Tests
        runs-on: ubuntu-latest
        strategy:
            matrix:
                python-version: [3.9, 3.11]
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-python@v4
              with:
                  python-version: ${{ matrix.python-version }}
            - run: |
                  cd orchestrator
                  pip install -r requirements.txt
                  pip install pytest pytest-cov flake8 black mypy
            - run: |
                  cd orchestrator
                  flake8 . --max-line-length=100
                  black --check .
                  mypy .
            - run: |
                  cd orchestrator
                  pytest tests/ --cov=. --cov-report=xml

    # Security Scanning
    security-scan:
        name: Security Scan
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Run Trivy vulnerability scanner
              uses: aquasecurity/trivy-action@master
              with:
                  scan-type: 'fs'
                  scan-ref: '.'
            - name: npm audit
              run: npm audit --production
            - name: Python dependency check
              run: |
                  pip install safety
                  cd orchestrator && safety check

    # RF Hardware Integration Tests (Optional)
    hardware-simulation-tests:
        name: Hardware Simulation Tests
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: '20'
            - run: npm ci
            - run: npm run test:hardware-sim
```

### Deployment Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
    push:
        tags:
            - 'v*'

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Build Docker images
              run: |
                  docker build -t argos-frontend .
                  docker build -t argos-orchestrator ./orchestrator
            - name: Deploy to Server
              env:
                  DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
                  DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
              run: |
                  # Deployment script for your infrastructure
```

## 2. Issue Templates

### Bug Report: `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug in RF signal detection or UI
title: '[BUG] '
labels: bug
assignees: ''
---

**Bug Type**

- [ ] HackRF Integration
- [ ] Kismet Integration
- [ ] Signal Processing
- [ ] UI/Frontend
- [ ] Database/Storage
- [ ] WebSocket Communication
- [ ] Other

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**

1. Hardware setup (HackRF/Kismet configuration)
2. Frequency range being monitored
3. Steps to reproduce
4. Error messages/logs

**Expected behavior**
What you expected to happen.

**System Information:**

- OS: [e.g., Raspberry Pi OS]
- HackRF firmware version:
- Kismet version:
- Browser:
- Node version:
- Python version:

**Logs**
```

Paste relevant logs here

```

**Additional context**
Add any other context, including signal environment details.
```

### Feature Request: `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest new RF monitoring capabilities
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Feature Category**

- [ ] Signal Detection Algorithm
- [ ] Frequency Analysis
- [ ] UI Visualization
- [ ] Hardware Support
- [ ] Data Export/Integration
- [ ] Performance Optimization

**Is your feature request related to a problem?**
Description of the problem or use case.

**Describe the solution**
Clear description of the desired functionality.

**RF/Radio Context**

- Frequency ranges affected:
- Signal types involved:
- Hardware requirements:

**Alternative Solutions**
Other approaches you've considered.

**Additional context**
Any mockups, diagrams, or technical specifications.
```

### Security Issue: `.github/ISSUE_TEMPLATE/security_issue.md`

```markdown
---
name: Security Issue
about: Report security vulnerabilities
title: '[SECURITY] '
labels: security
assignees: ''
---

**DO NOT report security vulnerabilities publicly. Email security@[your-domain] instead.**

If this is not a security issue, please describe:

**Component Affected**

- [ ] WebSocket endpoints
- [ ] API authentication
- [ ] Database access
- [ ] Hardware control
- [ ] Other

**Description**
Brief description without exposing vulnerability details.
```

## 3. Pull Request Template

### `.github/pull_request_template.md`

```markdown
## Description

Brief description of changes and their purpose.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Documentation
- [ ] Security fix

## Components Affected

- [ ] Frontend (SvelteKit)
- [ ] Backend API
- [ ] Python Orchestrator
- [ ] HackRF Integration
- [ ] Kismet Integration
- [ ] Database Schema
- [ ] WebSocket Handlers

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Tested with HackRF hardware
- [ ] Tested with Kismet
- [ ] Performance benchmarks run
- [ ] No memory leaks detected

## Security Checklist

- [ ] Input validation added
- [ ] No hardcoded credentials
- [ ] Secure WebSocket implementation
- [ ] Rate limiting considered
- [ ] Hardware access controls verified

## RF/Radio Considerations

- Frequency ranges tested:
- Signal types verified:
- Hardware compatibility checked:

## Screenshots/Logs

If applicable, add screenshots or relevant log outputs.

## Breaking Changes

List any breaking changes and migration steps.

## Related Issues

Closes #(issue number)
```

## 4. Additional GitHub Actions

### Automated Dependency Updates: `.github/workflows/dependabot.yml`

```yaml
version: 2
updates:
    - package-ecosystem: 'npm'
      directory: '/'
      schedule:
          interval: 'weekly'
      labels:
          - 'dependencies'
          - 'frontend'

    - package-ecosystem: 'pip'
      directory: '/orchestrator'
      schedule:
          interval: 'weekly'
      labels:
          - 'dependencies'
          - 'backend'
```

### Code Quality: `.github/workflows/codeql.yml`

```yaml
name: 'CodeQL'

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]
    schedule:
        - cron: '30 1 * * 0'

jobs:
    analyze:
        name: Analyze
        runs-on: ubuntu-latest
        strategy:
            matrix:
                language: ['javascript', 'python']
        steps:
            - uses: actions/checkout@v4
            - uses: github/codeql-action/init@v2
              with:
                  languages: ${{ matrix.language }}
            - uses: github/codeql-action/analyze@v2
```

## 5. Branch Protection Rules

### Main Branch Protection

```yaml
Settings → Branches → Add rule:

Branch name pattern: main

Protection rules:
✓ Require a pull request before merging
  ✓ Require approvals: 1
  ✓ Dismiss stale pull request approvals
  ✓ Require review from CODEOWNERS
✓ Require status checks to pass
  ✓ frontend-tests
  ✓ python-tests
  ✓ security-scan
✓ Require branches to be up to date
✓ Require conversation resolution
✓ Require signed commits
✓ Include administrators
✓ Restrict who can push to matching branches
```

## 6. Repository Settings

### Recommended Settings

```yaml
General:
- Default branch: main
- Features:
  ✓ Issues
  ✓ Projects
  ✓ Wiki (for RF documentation)

Security:
- Vulnerability alerts: Enabled
- Dependabot security updates: Enabled
- Secret scanning: Enabled
- Code scanning: Enabled

Pages (if documentation site):
- Source: Deploy from a branch
- Branch: gh-pages
```

## 7. CODEOWNERS File

### `.github/CODEOWNERS`

```
# Global owners
* @christian

# Frontend specific
/src/ @christian
/static/ @christian
*.svelte @christian
*.ts @christian

# Backend specific
/orchestrator/ @christian
*.py @christian

# Hardware integration
/src/lib/server/hackrf/ @christian
/src/lib/server/kismet/ @christian

# Documentation
/docs/ @christian
*.md @christian
```

## 8. Python Requirements Management

### Create `orchestrator/requirements.txt`

```
# Core dependencies
asyncio>=3.11
aiohttp>=3.9.0
websockets>=12.0
numpy>=1.24.0
pandas>=2.0.0

# Database
aiosqlite>=0.19.0

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0

# Code quality
black>=23.0.0
flake8>=6.0.0
mypy>=1.5.0

# RF/Signal processing (if needed)
scipy>=1.11.0
scikit-rf>=0.29.0
```

### Create `orchestrator/requirements-dev.txt`

```
-r requirements.txt

# Development tools
ipython>=8.15.0
jupyter>=1.0.0
pre-commit>=3.5.0
```

## 9. Pre-commit Configuration

### `.pre-commit-config.yaml`

```yaml
repos:
    - repo: https://github.com/pre-commit/pre-commit-hooks
      rev: v4.5.0
      hooks:
          - id: trailing-whitespace
          - id: end-of-file-fixer
          - id: check-yaml
          - id: check-added-large-files
          - id: check-merge-conflict

    - repo: https://github.com/psf/black
      rev: 23.10.0
      hooks:
          - id: black
            files: orchestrator/.*\.py$

    - repo: https://github.com/PyCQA/flake8
      rev: 6.1.0
      hooks:
          - id: flake8
            files: orchestrator/.*\.py$

    - repo: https://github.com/pre-commit/mirrors-prettier
      rev: v3.0.3
      hooks:
          - id: prettier
            files: \.(js|ts|svelte|json|yaml|yml|md)$
```

## Implementation Steps

1. **Phase 1: Basic CI Setup**
    - Implement main CI workflow
    - Add issue templates
    - Configure branch protection

2. **Phase 2: Security & Quality**
    - Add security scanning
    - Implement CodeQL analysis
    - Set up Dependabot

3. **Phase 3: Advanced Features**
    - Add deployment workflows
    - Configure pre-commit hooks
    - Set up automated documentation

4. **Phase 4: RF-Specific Testing**
    - Create hardware simulation tests
    - Add signal processing validation
    - Implement performance benchmarks

## Notes

- Adjust Python versions based on your deployment environment
- Consider adding RF hardware emulation for CI testing
- Monitor CI minutes usage with parallel jobs
- Set up secrets for deployment credentials
- Consider matrix testing for different hardware configurations
