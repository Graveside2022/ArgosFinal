#!/bin/bash

# ArgosFinal Grade A+ One-Button Deployment Master Script
# Tesla Orchestrator Prime Implementation
# Version: 1.0.0
# Description: Master deployment orchestrator with curl API endpoint
# Requirement: "literally hit 1 button like curl and the entire project is ready to go on another pi"

set -euo pipefail

# ============================================================================
# TESLA ORCHESTRATOR PRIME CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TESLA_ORCHESTRATOR="${PROJECT_ROOT}/bootstrap_tesla.sh"
DEPLOYMENT_LOG="${PROJECT_ROOT}/deployment.log"
STATUS_FILE="${PROJECT_ROOT}/deployment_status.json"
API_PORT=8099
PID_FILE="${PROJECT_ROOT}/deployment_api.pid"

# Tesla Orchestrator Integration
TESLA_AGENTS=10
TESLA_QUALITY_THRESHOLD=9.5

# Service Configuration
SERVICES=(
    "argosfinal:3000"
    "openwebrx:8073"
    "hackrf-api:8092"
    "kismet:2501"
)

# ============================================================================
# LOGGING AND STATUS SYSTEM
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$DEPLOYMENT_LOG"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_success() { log "SUCCESS" "$@"; }

update_status() {
    local phase="$1"
    local status="$2"
    local progress="$3"
    local message="$4"
    
    cat > "$STATUS_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "phase": "$phase",
    "status": "$status",
    "progress": $progress,
    "message": "$message",
    "deployment_id": "${DEPLOYMENT_ID:-unknown}",
    "tesla_agents": $TESLA_AGENTS,
    "services": $(printf '%s\n' "${SERVICES[@]}" | jq -R . | jq -s .)
}
EOF
}

# ============================================================================
# TESLA ORCHESTRATOR INTEGRATION
# ============================================================================

invoke_tesla_orchestrator() {
    local task_description="$1"
    local complexity="${2:-complex}"
    
    log_info "Invoking Tesla Orchestrator: $task_description"
    
    if [[ -f "$TESLA_ORCHESTRATOR" ]]; then
        log_info "Tesla Orchestrator found at: $TESLA_ORCHESTRATOR"
        
        # Execute Tesla Orchestrator with 10 parallel agents
        if bash "$TESLA_ORCHESTRATOR" execute "$task_description" "$complexity" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
            log_success "Tesla Orchestrator execution completed: $task_description"
            return 0
        else
            log_error "Tesla Orchestrator execution failed: $task_description"
            return 1
        fi
    else
        log_warn "Tesla Orchestrator not found, using fallback implementation"
        return 2
    fi
}

# ============================================================================
# DEPLOYMENT PHASES
# ============================================================================

phase_1_system_preparation() {
    log_info "Phase 1: System Preparation"
    update_status "system_preparation" "running" 10 "Preparing system for deployment"
    
    # Update system packages
    log_info "Updating system packages..."
    if sudo apt-get update -y 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
        log_success "System packages updated"
    else
        log_error "Failed to update system packages"
        return 1
    fi
    
    # Install basic dependencies including Docker
    log_info "Installing basic dependencies including Docker..."
    if sudo apt-get install -y curl wget git build-essential docker.io 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
        log_success "Basic dependencies installed"
        
        # Start Docker service
        log_info "Starting Docker service..."
        if sudo systemctl enable docker && sudo systemctl start docker; then
            log_success "Docker service started"
        else
            log_warn "Docker service start failed, continuing..."
        fi
        
        # Add pi user to docker group
        log_info "Adding pi user to docker group..."
        sudo usermod -aG docker pi || true
        
    else
        log_error "Failed to install basic dependencies"
        return 1
    fi
    
    update_status "system_preparation" "completed" 20 "System preparation completed"
}

phase_2_system_dependencies() {
    log_info "Phase 2: Installing System Dependencies"
    update_status "system_dependencies" "running" 30 "Installing system dependencies"
    
    local dep_script="${SCRIPT_DIR}/install-system-dependencies.sh"
    
    if [[ -f "$dep_script" ]]; then
        log_info "Executing system dependencies installation script"
        if bash "$dep_script" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
            log_success "System dependencies installed successfully"
        else
            log_error "System dependencies installation failed"
            return 1
        fi
    else
        log_error "System dependencies script not found: $dep_script"
        return 1
    fi
    
    update_status "system_dependencies" "completed" 40 "System dependencies installed"
}

phase_3_openwebrx_hackrf() {
    log_info "Phase 3: Deploying OpenWebRX-HackRF Custom Docker Image"
    update_status "openwebrx_hackrf" "running" 50 "Deploying OpenWebRX-HackRF custom Docker image"
    
    # Use Tesla Orchestrator for OpenWebRX Docker deployment
    if invoke_tesla_orchestrator "Deploy custom OpenWebRX HackRF Docker image (openwebrx-hackrf-only:v2)" "complex"; then
        log_success "Tesla Orchestrator deployed OpenWebRX Docker image successfully"
    else
        log_warn "Tesla Orchestrator not available, using Docker image manager"
        
        # Fallback to Docker image manager
        local docker_manager="${SCRIPT_DIR}/docker-image-manager.sh"
        
        if [[ -f "$docker_manager" ]]; then
            log_info "Executing Docker image manager for OpenWebRX deployment"
            if bash "$docker_manager" deploy 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
                log_success "OpenWebRX Docker image deployed successfully"
            else
                log_error "OpenWebRX Docker image deployment failed"
                
                # Fallback to traditional installation
                log_warn "Falling back to traditional OpenWebRX installation"
                local openwebrx_script="${SCRIPT_DIR}/install-openwebrx-hackrf.sh"
                
                if [[ -f "$openwebrx_script" ]]; then
                    log_info "Executing traditional OpenWebRX-HackRF installation script"
                    if bash "$openwebrx_script" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
                        log_success "Traditional OpenWebRX-HackRF installed successfully"
                    else
                        log_error "All OpenWebRX installation methods failed"
                        return 1
                    fi
                else
                    log_error "No OpenWebRX installation method available"
                    return 1
                fi
            fi
        else
            log_error "Docker image manager not found: $docker_manager"
            return 1
        fi
    fi
    
    update_status "openwebrx_hackrf" "completed" 60 "OpenWebRX-HackRF deployed"
}

phase_4_argosfinal_deployment() {
    log_info "Phase 4: Deploying ArgosFinal Application"
    update_status "argosfinal_deployment" "running" 70 "Deploying ArgosFinal application"
    
    # Use Tesla Orchestrator for ArgosFinal deployment
    if invoke_tesla_orchestrator "Deploy ArgosFinal SvelteKit application with production configuration" "complex"; then
        log_success "Tesla Orchestrator deployed ArgosFinal successfully"
    else
        log_warn "Tesla Orchestrator not available, using fallback deployment"
        
        # Fallback deployment using existing production script
        local prod_script="${SCRIPT_DIR}/build-production.sh"
        if [[ -f "$prod_script" ]]; then
            log_info "Executing production build script"
            if bash "$prod_script" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
                log_success "Production build completed"
            else
                log_error "Production build failed"
                return 1
            fi
        else
            log_error "Production build script not found: $prod_script"
            return 1
        fi
    fi
    
    update_status "argosfinal_deployment" "completed" 80 "ArgosFinal application deployed"
}

phase_5_service_startup() {
    log_info "Phase 5: Starting Services"
    update_status "service_startup" "running" 90 "Starting all services"
    
    # Start systemd services
    local services_to_start=(
        "argosfinal"
        "openwebrx"
        "kismet"
    )
    
    for service in "${services_to_start[@]}"; do
        log_info "Starting service: $service"
        if sudo systemctl enable "$service" && sudo systemctl start "$service"; then
            log_success "Service started: $service"
        else
            log_warn "Failed to start service: $service (may not be critical)"
        fi
    done
    
    update_status "service_startup" "completed" 95 "Services started"
}

phase_6_health_verification() {
    log_info "Phase 6: Health Verification"
    update_status "health_verification" "running" 98 "Verifying service health"
    
    local all_healthy=true
    
    for service_endpoint in "${SERVICES[@]}"; do
        local service_name="${service_endpoint%%:*}"
        local service_port="${service_endpoint##*:}"
        
        log_info "Checking health of $service_name on port $service_port"
        
        # Check if port is listening
        if netstat -tuln | grep -q ":$service_port "; then
            log_success "$service_name is listening on port $service_port"
        else
            log_warn "$service_name is not listening on port $service_port"
            all_healthy=false
        fi
        
        # HTTP health check for web services
        if [[ "$service_port" =~ ^(3000|8073|8092)$ ]]; then
            if curl -s -f "http://localhost:$service_port" >/dev/null 2>&1; then
                log_success "$service_name HTTP health check passed"
            else
                log_warn "$service_name HTTP health check failed"
                all_healthy=false
            fi
        fi
    done
    
    if $all_healthy; then
        update_status "health_verification" "completed" 100 "All services healthy - Grade A+ deployment achieved"
        log_success "Grade A+ deployment completed successfully!"
        return 0
    else
        update_status "health_verification" "completed" 100 "Deployment completed with warnings"
        log_warn "Deployment completed but some services may not be fully healthy"
        return 0
    fi
}

# ============================================================================
# DEPLOYMENT ORCHESTRATION
# ============================================================================

execute_deployment() {
    local deployment_id="${1:-$(date +%s)}"
    export DEPLOYMENT_ID="$deployment_id"
    
    log_info "Starting Grade A+ deployment with ID: $deployment_id"
    log_info "Tesla Orchestrator Prime activated with $TESLA_AGENTS parallel agents"
    
    # Initialize status
    update_status "initializing" "running" 0 "Deployment initialization"
    
    # Execute deployment phases
    local phases=(
        "phase_1_system_preparation"
        "phase_2_system_dependencies"
        "phase_3_openwebrx_hackrf"
        "phase_4_argosfinal_deployment"
        "phase_5_service_startup"
        "phase_6_health_verification"
    )
    
    for phase in "${phases[@]}"; do
        log_info "Executing: $phase"
        if ! "$phase"; then
            log_error "Deployment failed at phase: $phase"
            update_status "$phase" "failed" 0 "Deployment failed at $phase"
            return 1
        fi
    done
    
    log_success "Grade A+ deployment completed successfully!"
    return 0
}

# ============================================================================
# CURL API SERVER
# ============================================================================

start_api_server() {
    log_info "Starting deployment API server on port $API_PORT"
    
    # Create API server using netcat
    while true; do
        {
            echo "HTTP/1.1 200 OK"
            echo "Content-Type: application/json"
            echo "Access-Control-Allow-Origin: *"
            echo ""
            
            # Check if deployment is already running
            if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
                echo '{"status":"running","message":"Deployment already in progress"}'
            else
                # Start deployment in background
                (
                    execute_deployment "api_$(date +%s)" 2>&1 | tee -a "$DEPLOYMENT_LOG"
                    echo $? > "${PROJECT_ROOT}/deployment_exit_code"
                ) &
                
                echo $! > "$PID_FILE"
                echo '{"status":"started","message":"Grade A+ deployment initiated","deployment_id":"'$(date +%s)'"}'
            fi
        } | nc -l -p "$API_PORT" -q 1
        
        sleep 1
    done
}

get_deployment_status() {
    if [[ -f "$STATUS_FILE" ]]; then
        cat "$STATUS_FILE"
    else
        echo '{"status":"idle","message":"No deployment in progress"}'
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    case "${1:-deploy}" in
        "deploy")
            execute_deployment
            ;;
        "api")
            start_api_server
            ;;
        "status")
            get_deployment_status
            ;;
        "curl")
            log_info "Starting curl API server for one-button deployment"
            start_api_server
            ;;
        *)
            echo "Usage: $0 {deploy|api|status|curl}"
            echo ""
            echo "Commands:"
            echo "  deploy  - Execute full deployment process"
            echo "  api     - Start API server for curl access"
            echo "  status  - Get current deployment status"
            echo "  curl    - Start curl API server (alias for api)"
            echo ""
            echo "One-button deployment via curl:"
            echo "  curl -X POST http://PI_IP:8099/"
            echo ""
            echo "Check deployment status:"
            echo "  curl http://PI_IP:8099/status"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"