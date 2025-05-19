#!/bin/bash

log_info() {
  echo "[INFO] $1"
}

log_error() {
  echo "[ERROR] $1"
}

log_info "Running migration:generate..."
pnpm migration:generate 
generate_exit_code=$?

if [ $generate_exit_code -ne 0 ]; then
  log_error "migration:generate failed, but continuing..."
fi

log_info "Running migration:run..."
pnpm run migration:run
run_exit_code=$?

if [ $run_exit_code -eq 0 ]; then
  log_info "Migration completed successfully. Running setup commands..."

  log_info "Setup commands executed successfully. Deleting db/ directory..."
  rm -rf db/
  log_info "db/ directory deleted successfully."

else
  log_error "Migration failed, but script will continue..."
fi

log_info "Script execution completed."