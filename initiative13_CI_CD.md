# Initiative 13: The Definitive Grade A+ CI/CD Implementation Guide

## 1. Executive Summary & Philosophy

This document provides a professional, Grade A+ analysis and a meticulous, step-by-step implementation plan for establishing a Continuous Integration (CI) and Continuous Delivery (CD) pipeline for the ArgosFinal project.

**Philosophy:** This plan is built on the principle of **"Robust Simplicity."** Every step is designed to be as simple as possible for you, the user, while being grounded in professional best practices. It automates complex tasks on GitHub's servers to make your local workflow on the Raspberry Pi effortless and error-free.

**The Goal:**

1.  **Automate Quality:** To guarantee that the code in your `main` branch is always tested, validated, and stable.
2.  **Simplify Deployment:** To reduce the process of updating the application on your Pi to a simple, foolproof, three-step process.
3.  **Provide Effortless Rollbacks:** To make reverting to a previous version a trivial, stress-free action.

---

## 2. In-Depth Analysis: Current State & Identified Risks

A detailed review of the project reveals a solid foundation but a CI/CD strategy that is both non-existent for your use case and overly complex where it has been attempted. This creates significant risks.

### Problem 1: Existing CI Workflow is Mismatched to Your Deployment Strategy

- **Analysis:** The project's `ci.yml` file defines a workflow to build, test, and then package the **ArgosFinal application itself** into a Docker image, which is then pushed to a container registry. This is a standard practice for cloud-based deployments. However, your deployment model is to run the ArgosFinal Node.js application directly on the Raspberry Pi host, while using Docker (via `docker-compose`) only to manage separate, third-party services like OpenWebRX. Therefore, the job to build a Docker image _for ArgosFinal_ is unnecessary and does not align with your actual deployment method.
- **Risk:** This creates confusion between how dependencies are run (Docker) and how the core application is run (Node.js). It adds complexity and maintenance overhead for a CI step that produces an artifact you will not use.
- **Decision:** We will discard the existing `ci.yml` and `test.yml` files. The valuable logic (the specific test commands) will be migrated into our new, simplified workflows, while the irrelevant Docker-building steps for the main application will be removed.

### Problem 2: The "Manual `git pull`" Deployment Model is Fragile

The current method of updating the application on the Raspberry Pi is likely a manual `git pull` followed by on-device build commands.

- **Analysis:** This process lacks any automated quality assurance. A commit pushed to `main` may have passing tests on a developer's machine but fail on another, or contain bugs that were not caught. Pulling this directly to your "production" Pi is unpredictable.
- **Risk:** This leads to a high probability of deploying a broken version of the application, forcing you to debug under pressure on the device that should be the most stable.

### Problem 3: On-Device Builds are Inefficient and Risky

Executing `npm install` and `npm run build` on the Raspberry Pi is not a robust or reliable practice.

- **Analysis:** The Raspberry Pi 5, while powerful, has finite resources. The `vite build` process, in particular, can be memory-intensive. A build that works perfectly on a development laptop with more RAM may fail on the Pi. This process also litters the application directory with source code (`src/`), test files (`tests/`), and development packages (`devDependencies` in `node_modules/`) that are not required to run the application.
- **Risk:** Unreliable deployments, slow update times, and an untidy production environment that increases the chance of errors.

### Problem 4: No Clear Versioning or Rollback Strategy

If a deployment goes wrong, there is no simple, defined process for reverting to the last stable version.

- **Analysis:** Recovering from a bad deployment requires using `git` commands (`git reset`, `git log`, etc.) to manually rewind the state of the code. This is a high-stakes, error-prone procedure.
- **Risk:** A simple update can lead to extended downtime and a frustrating, high-pressure recovery effort.

**Conclusion:** The current state is untenable for a professional project. The following implementation plan will systematically eliminate these risks.

---

## 3. Meticulous Implementation Plan

This plan provides the **exact commands** to build your new CI/CD pipeline.

### Phase 1: Establish Continuous Integration (The Guardian)

**Goal:** Create a workflow that automatically validates every change to your `main` branch.

#### **Task 1.1: Clean Up Existing Workflows**

We will start with a clean slate.

1.  **Action:** Open your terminal on your development machine and run the following commands to delete the old workflow files.
    ```bash
    rm .github/workflows/ci.yml
    rm .github/workflows/test.yml
    ```

#### **Task 1.2: Create the New CI Workflow**

This workflow will run your quality checks.

1.  **Action:** Create the directory for the new workflow file. The `-p` flag ensures it doesn't error if the directory already exists.

    ```bash
    mkdir -p .github/workflows
    ```

2.  **Action:** Create the new `ci.yml` file using this command. This command uses `cat` and a `HEREDOC` to write the entire file at once, preventing copy-paste errors.

    ```bash
    cat > .github/workflows/ci.yml << 'EOF'
    # .github/workflows/ci.yml

    name: 'CI: Validate Code Quality'

    on:
      push:
        branches: [ main ]
      pull_request:
        branches: [ main ]

    jobs:
      validate:
        name: 'Validate Code, Tests, and Build'
        runs-on: ubuntu-latest

        steps:
          - name: 'Checkout Code'
            uses: actions/checkout@v4

          - name: 'Setup Node.js v20'
            uses: actions/setup-node@v4
            with:
              node-version: '20.x'
              cache: 'npm'

          - name: 'Install Dependencies'
            run: npm ci

          - name: 'Run Linting, Formatting, and Type Checks'
            run: |
              npm run lint
              npm run format:check
              npm run typecheck

          - name: 'Run Automated Tests'
            run: npm test

          - name: 'Verify Production Build'
            run: npm run build
    EOF
    ```

#### **Task 1.3: Commit and Validate the CI Workflow**

1.  **Action:** Add the changes to git and commit them with a clear message.

    ```bash
    git add .
    git commit -m "feat(ci): implement simplified CI validation workflow"
    ```

2.  **Action:** Push your changes to GitHub.

    ```bash
    git push
    ```

3.  **Verification:** Go to your project's GitHub page and click the **"Actions"** tab. You will see the "CI: Validate Code Quality" workflow running. After a few minutes, it should complete with a green checkmark, confirming your CI pipeline is active and working.

### Phase 2: Establish Continuous Delivery (The Packager)

**Goal:** Create a workflow that automatically builds and packages your application for a safe and easy release.

#### **Task 2.1: Create the Release Workflow**

1.  **Action:** Create the new `release.yml` file using the same `cat` method.

    ```bash
    cat > .github/workflows/release.yml << 'EOF'
    # .github/workflows/release.yml

    name: 'CD: Create Release Package'

    on:
      push:
        tags:
          - 'v*.*.*'

    jobs:
      build-and-release:
        name: 'Build and Package Application'
        runs-on: ubuntu-latest

        steps:
          - name: 'Checkout Code'
            uses: actions/checkout@v4

          - name: 'Setup Node.js v20'
            uses: actions/setup-node@v4
            with:
              node-version: '20.x'
              cache: 'npm'

          - name: 'Install All Dependencies for Build'
            run: npm ci

          - name: 'Build Application for Production'
            run: npm run build

          - name: 'Assemble Clean Production Package'
            run: |
              mkdir release
              cp -r build/ release/
              cp package.json release/
              # This next step is critical for a lean production environment.
              # It removes all development-only packages (like vitest, eslint),
              # resulting in a smaller, more secure, and faster installation on the Pi.
              cd release
              npm ci --omit=dev
              cd ..

          - name: 'Create Compressed Release Tarball'
            run: tar -czvf argos-final-${{ github.ref_name }}.tar.gz release

          - name: 'Create GitHub Release and Upload Artifact'
            # This action automates creating a release page on GitHub.
            uses: softprops/action-gh-release@v1
            with:
              # This tells the action to upload the .tar.gz file we just created.
              files: argos-final-${{ github.ref_name }}.tar.gz
            env:
              # This token is a secure, temporary key provided by GitHub Actions.
              # It requires no setup on your part and allows the workflow to
              # create a release on your behalf.
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    EOF
    ```

#### **Task 2.2: Commit and Validate the CD Workflow**

1.  **Action:** Commit the new file.

    ```bash
    git add .github/workflows/release.yml
    git commit -m "feat(cd): implement release packaging workflow"
    git push
    ```

2.  **Action:** Now, trigger your first release by creating and pushing a version tag.

    ```bash
    git tag v1.0.0
    git push origin v1.0.0
    ```

3.  **Verification:** Go to the **"Actions"** tab on GitHub. You will see the "CD: Create Release Package" workflow running. When it finishes, go to your repository's main page and click on **"Releases"** (on the right sidebar). You will see a `v1.0.0` release with an `argos-final-v1.0.0.tar.gz` file attached. This confirms your CD pipeline is working perfectly.

---

## 4. The A+ User Guide: Deployment & Rollbacks

This is your new, definitive guide for managing the application on your Raspberry Pi.

### Prerequisite: Configure PM2 for Production

To ensure your application runs continuously and restarts automatically on boot, we use `pm2`, a professional process manager for Node.js.

- **Action (One-time setup on your Pi):**
    1.  Install `pm2` globally:
        ```bash
        sudo npm install -g pm2
        ```
    2.  Set up the `pm2` startup script. This command will generate another command that you must copy and run.
        ```bash
        pm2 startup
        ```
        _Follow the instructions it gives you. This ensures `pm2` will restart your app after a reboot._

### The Fault-Tolerant Deployment Process

This process is designed to be **atomic**. It ensures there is never a moment where your application is in a broken or half-deployed state.

**Convention:**

- Your live application will run from `/home/pi/argos-app`.
- Your `.env` file, containing your secrets, will be stored safely at `/home/pi/argos.env`.

1.  **On your Dev PC (Create a Release):**
    When your code is ready, create and push a new version tag.

    ```bash
    git tag v1.0.1  # Increment the version number appropriately
    git push origin v1.0.1
    ```

2.  **On your Raspberry Pi (Download the Release):**
    - Go to your project's GitHub **"Releases"** page.
    - Download the new asset (e.g., `argos-final-v1.0.1.tar.gz`) to your `~/Downloads` folder.

3.  **On your Raspberry Pi (Deploy the Release):**
    - **Step A: Unpack to a temporary directory.** This is the key safety step.
        ```bash
        mkdir -p ~/argos-app-new
        tar -xzvf ~/Downloads/argos-final-v1.0.1.tar.gz -C ~/argos-app-new
        ```
    - **Step B: Copy the environment file.** Your configuration is now ready.
        ```bash
        cp ~/argos.env ~/argos-app-new/release/.env
        ```
    - **Step C: Stop the old application.**
        ```bash
        pm2 stop argos
        ```
    - **Step D: Atomically switch to the new version.** We move the old version aside and activate the new one. This is instantaneous.
        ```bash
        mv ~/argos-app ~/argos-app-old && mv ~/argos-app-new ~/argos-app
        ```
    - **Step E: Start the new version.**
        ```bash
        pm2 start ~/argos-app/release/build/index.js --name argos
        ```
    - **Step F: Clean up.** Once you confirm the app is working, you can safely remove the old version.
        ```bash
        rm -rf ~/argos-app-old
        ```
    - **Step G: Save the process list.** This ensures your new version will restart on boot.
        ```bash
        pm2 save
        ```

### The Instant Rollback Process

If `v1.0.1` has a bug, this process lets you revert to `v1.0.0` in seconds.

1.  **On your Raspberry Pi:**
    - Stop the broken application: `pm2 stop argos`
    - Move the broken version aside: `mv ~/argos-app ~/argos-app-broken`
    - **Instantly restore the last working version:** `mv ~/argos-app-old ~/argos-app`
    - Restart the old, stable version: `pm2 start argos`
    - Save the process list: `pm2 save`
    - You can now safely delete the broken version: `rm -rf ~/argos-app-broken`

This process guarantees you always have a working copy on hand and can recover from a bad deployment almost instantly.
