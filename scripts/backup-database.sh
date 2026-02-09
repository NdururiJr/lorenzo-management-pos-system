#!/bin/bash

###############################################################################
# Firebase Database Backup Script
#
# Creates a backup of the Firestore database to Google Cloud Storage.
# Requires Firebase CLI and gcloud CLI to be installed and authenticated.
#
# Usage:
#   ./scripts/backup-database.sh                    # Create backup with timestamp
#   ./scripts/backup-database.sh pre-cleanup        # Create pre-cleanup backup
#   ./scripts/backup-database.sh --list             # List all backups
#   ./scripts/backup-database.sh --restore [path]   # Restore from backup
#
# Requirements:
#   - Firebase CLI: npm install -g firebase-tools
#   - gcloud CLI: https://cloud.google.com/sdk/docs/install
#   - Authenticated: firebase login && gcloud auth login
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="lorenzo-dry-cleaners-7302f"
BUCKET="gs://${PROJECT_ID}.appspot.com"
BACKUP_BASE_PATH="${BUCKET}/firestore-exports"

###############################################################################
# HELPER FUNCTIONS
###############################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

###############################################################################
# CHECK PREREQUISITES
###############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found"
        echo "Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "gcloud CLI found"

    # Check if firebase is installed
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI not found"
        echo "Install with: npm install -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI found"

    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        print_warning "Not authenticated with gcloud"
        echo "Run: gcloud auth login"
        exit 1
    fi
    print_success "gcloud authenticated"

    echo ""
}

###############################################################################
# CREATE BACKUP
###############################################################################

create_backup() {
    local backup_name=$1
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_path="${BACKUP_BASE_PATH}/${backup_name:-backup}-${timestamp}"

    print_header "Creating Firestore Backup"
    print_info "Project: ${PROJECT_ID}"
    print_info "Backup Path: ${backup_path}"
    echo ""

    # Export Firestore database
    print_info "Starting Firestore export..."
    gcloud firestore export "${backup_path}" \
        --project="${PROJECT_ID}" \
        --async

    print_success "Backup initiated"
    print_info "Backup path: ${backup_path}"
    echo ""
    print_warning "Note: Export may take several minutes to complete."
    print_info "Check status with: gcloud firestore operations list --project=${PROJECT_ID}"
    echo ""

    # Save backup info locally
    echo "${backup_path}" >> .backups.log
    print_success "Backup path saved to .backups.log"
}

###############################################################################
# LIST BACKUPS
###############################################################################

list_backups() {
    print_header "Available Backups"

    # List backups from Cloud Storage
    print_info "Listing backups from: ${BACKUP_BASE_PATH}"
    echo ""

    gsutil ls -l "${BACKUP_BASE_PATH}/" || {
        print_error "Failed to list backups"
        echo "Make sure you have access to the bucket: ${BUCKET}"
        exit 1
    }

    echo ""
    print_info "Tip: Use the full path to restore a backup"
}

###############################################################################
# RESTORE BACKUP
###############################################################################

restore_backup() {
    local backup_path=$1

    if [ -z "$backup_path" ]; then
        print_error "Backup path required"
        echo "Usage: $0 --restore <backup-path>"
        echo ""
        echo "Example:"
        echo "  $0 --restore ${BACKUP_BASE_PATH}/backup-20260207-143000"
        exit 1
    fi

    print_header "Restoring from Backup"
    print_warning "⚠️  WARNING: This will overwrite ALL current data!"
    print_info "Backup Path: ${backup_path}"
    echo ""

    read -p "Are you sure you want to proceed? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Restore cancelled"
        exit 0
    fi

    print_info "Starting Firestore import..."
    gcloud firestore import "${backup_path}" \
        --project="${PROJECT_ID}" \
        --async

    print_success "Restore initiated"
    echo ""
    print_warning "Note: Import may take several minutes to complete."
    print_info "Check status with: gcloud firestore operations list --project=${PROJECT_ID}"
}

###############################################################################
# MAIN
###############################################################################

main() {
    case "${1:-}" in
        --list)
            check_prerequisites
            list_backups
            ;;
        --restore)
            check_prerequisites
            restore_backup "$2"
            ;;
        --help|-h)
            echo "Firebase Database Backup Script"
            echo ""
            echo "Usage:"
            echo "  $0                        # Create backup with timestamp"
            echo "  $0 pre-cleanup            # Create pre-cleanup backup"
            echo "  $0 --list                 # List all backups"
            echo "  $0 --restore <path>       # Restore from backup"
            echo "  $0 --help                 # Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 pre-cleanup"
            echo "  $0 --list"
            echo "  $0 --restore ${BACKUP_BASE_PATH}/backup-20260207-143000"
            ;;
        *)
            check_prerequisites
            create_backup "$1"
            ;;
    esac
}

main "$@"
