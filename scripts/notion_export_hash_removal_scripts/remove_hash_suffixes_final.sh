#!/bin/bash

# Script to remove 32-character hexadecimal hash suffixes from files and directories
# Works from deepest level first to avoid path conflicts
# Creates a mapping file for later use in updating markdown links

set -euo pipefail

# Configuration
TARGET_DIR="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/references_deprecated/제품서비스매뉴얼_20250714"
MAPPING_FILE="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/hash_suffix_mapping.txt"
LOG_FILE="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/rename_log.txt"
DRY_RUN=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to log messages
log_message() {
    local message="$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $message" | tee -a "$LOG_FILE"
}

# Function to check if a string has a 32-character hex hash suffix (before extension if any)
has_hash_suffix() {
    local name="$1"
    # Check if the name contains a space followed by 32 hex characters, optionally followed by an extension
    if [[ "$name" =~ \ [0-9a-f]{32}(\.[^.]+)?$ ]]; then
        return 0
    fi
    return 1
}

# Function to remove hash suffix from a name
remove_hash_suffix() {
    local name="$1"
    # Remove the space and 32 hex characters, preserving any file extension
    echo "$name" | sed 's/ [0-9a-f]\{32\}\(\.[^.]*\)\?$/\1/'
}

# Function to process a single item (file or directory)
process_item() {
    local old_path="$1"
    local item_type="$2"  # "file" or "directory"
    
    local dir_path=$(dirname "$old_path")
    local old_name=$(basename "$old_path")
    
    if has_hash_suffix "$old_name"; then
        local new_name=$(remove_hash_suffix "$old_name")
        local new_path="$dir_path/$new_name"
        
        # Check if target already exists
        if [[ -e "$new_path" ]]; then
            print_color "$YELLOW" "WARNING: Target already exists: $new_path"
            log_message "WARNING: Skipping $old_path - target exists: $new_path"
            return 1
        fi
        
        # Log the mapping
        if [[ "$DRY_RUN" == "false" ]]; then
            echo "OLD: $old_path" >> "$MAPPING_FILE"
            echo "NEW: $new_path" >> "$MAPPING_FILE"
            echo "TYPE: $item_type" >> "$MAPPING_FILE"
            echo "---" >> "$MAPPING_FILE"
        fi
        
        if [[ "$DRY_RUN" == "true" ]]; then
            print_color "$BLUE" "DRY RUN: Would rename $item_type:"
            print_color "$BLUE" "  FROM: $old_name"
            print_color "$BLUE" "  TO:   $new_name"
        else
            print_color "$GREEN" "Renaming $item_type:"
            print_color "$GREEN" "  FROM: $old_name"
            print_color "$GREEN" "  TO:   $new_name"
            
            if mv "$old_path" "$new_path"; then
                log_message "SUCCESS: Renamed $item_type: $old_path -> $new_path"
                return 0
            else
                print_color "$RED" "ERROR: Failed to rename $old_path"
                log_message "ERROR: Failed to rename $item_type: $old_path"
                return 1
            fi
        fi
        return 0
    fi
    return 1
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  --dry-run    Show what would be renamed without actually renaming"
    echo "  --help       Show this help message"
    echo ""
    echo "This script removes 32-character hexadecimal hash suffixes from files and directories"
    echo "in the target directory: $TARGET_DIR"
    echo ""
    echo "Output files:"
    echo "  Mapping file: $MAPPING_FILE"
    echo "  Log file: $LOG_FILE"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_color "$BLUE" "Starting hash suffix removal script"
    
    # Check if target directory exists
    if [[ ! -d "$TARGET_DIR" ]]; then
        print_color "$RED" "ERROR: Target directory does not exist: $TARGET_DIR"
        exit 1
    fi
    
    # Initialize output files
    if [[ "$DRY_RUN" == "false" ]]; then
        echo "# Hash Suffix Removal Mapping File" > "$MAPPING_FILE"
        echo "# Generated on $(date)" >> "$MAPPING_FILE"
        echo "# Format: OLD: <old_path>, NEW: <new_path>, TYPE: <file|directory>" >> "$MAPPING_FILE"
        echo "" >> "$MAPPING_FILE"
    fi
    
    echo "# Hash Suffix Removal Log" > "$LOG_FILE"
    echo "# Generated on $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    log_message "Starting hash suffix removal process"
    log_message "Target directory: $TARGET_DIR"
    log_message "Dry run mode: $DRY_RUN"
    
    # Use a much simpler approach - find all items and process them directly
    # Process files first, then directories
    
    print_color "$BLUE" "Processing files..."
    local file_success=0
    local file_errors=0
    local file_total=0
    
    # Process files using find with depth sorting
    while IFS= read -r file_path; do
        if [[ -n "$file_path" && -f "$file_path" ]]; then
            ((file_total++))
            if process_item "$file_path" "file"; then
                ((file_success++))
            else
                ((file_errors++))
            fi
        fi
    done < <(find "$TARGET_DIR" -type f | sort -r)
    
    print_color "$BLUE" "Processing directories..."
    local dir_success=0
    local dir_errors=0
    local dir_total=0
    
    # Process directories using find with depth sorting (deepest first)
    while IFS= read -r dir_path; do
        if [[ -n "$dir_path" && -d "$dir_path" && "$dir_path" != "$TARGET_DIR" ]]; then
            ((dir_total++))
            if process_item "$dir_path" "directory"; then
                ((dir_success++))
            else
                ((dir_errors++))
            fi
        fi
    done < <(find "$TARGET_DIR" -type d | sort -r)
    
    # Summary
    print_color "$GREEN" "Summary:"
    print_color "$GREEN" "  Files checked: $file_total"
    print_color "$GREEN" "  Files processed successfully: $file_success"
    print_color "$GREEN" "  File errors: $file_errors"
    print_color "$GREEN" "  Directories checked: $dir_total"
    print_color "$GREEN" "  Directories processed successfully: $dir_success"
    print_color "$GREEN" "  Directory errors: $dir_errors"
    
    log_message "Process completed"
    log_message "Files checked: $file_total"
    log_message "Files processed successfully: $file_success"
    log_message "File errors: $file_errors"
    log_message "Directories checked: $dir_total"
    log_message "Directories processed successfully: $dir_success"
    log_message "Directory errors: $dir_errors"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        print_color "$BLUE" "Mapping file created: $MAPPING_FILE"
        print_color "$BLUE" "Log file created: $LOG_FILE"
    else
        print_color "$YELLOW" "This was a dry run. Use without --dry-run to perform actual renaming."
    fi
}

# Run the main function
main "$@"