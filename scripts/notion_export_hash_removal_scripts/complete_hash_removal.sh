#!/bin/bash

# Complete hash removal script - removes all 32+ character hex hashes from filenames
# This script is more aggressive and handles all patterns

set -euo pipefail

TARGET_DIR="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/references_deprecated/제품서비스매뉴얼_20250714"
LOG_FILE="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/complete_hash_removal.log"

echo "=== Complete Hash Removal Script ===" | tee "$LOG_FILE"
echo "Target: $TARGET_DIR" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"

# Function to remove hash from a single item
remove_hash() {
    local item="$1"
    local parent_dir="$(dirname "$item")"
    local basename="$(basename "$item")"
    
    # Check if basename contains a 32+ character hex string
    if [[ "$basename" =~ [[:space:]][0-9a-f]{32,}(\.[^.]*)?$ ]]; then
        # Remove the hash pattern
        local new_name=$(echo "$basename" | sed -E 's/[[:space:]][0-9a-f]{32,}(\.[^.]*)?$/\1/')
        local new_path="$parent_dir/$new_name"
        
        # Check if target exists
        if [[ ! -e "$new_path" ]]; then
            if mv "$item" "$new_path"; then
                echo "RENAMED: $basename -> $new_name" | tee -a "$LOG_FILE"
                return 0
            else
                echo "ERROR: Failed to rename $basename" | tee -a "$LOG_FILE"
                return 1
            fi
        else
            echo "SKIP: Target exists for $basename" | tee -a "$LOG_FILE"
            return 1
        fi
    fi
    return 1
}

# Process multiple rounds to handle nested dependencies
MAX_ROUNDS=10
for round in $(seq 1 $MAX_ROUNDS); do
    echo "=== Round $round ===" | tee -a "$LOG_FILE"
    changes_made=0
    
    # Process files first (safer)
    while IFS= read -r -d '' file; do
        if remove_hash "$file"; then
            ((changes_made++))
        fi
    done < <(find "$TARGET_DIR" -type f -name "*[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*" -print0)
    
    # Process directories (deepest first)
    while IFS= read -r -d '' dir; do
        if remove_hash "$dir"; then
            ((changes_made++))
        fi
    done < <(find "$TARGET_DIR" -type d -name "*[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*" -print0 | sort -rz)
    
    echo "Round $round: $changes_made changes" | tee -a "$LOG_FILE"
    
    if [[ $changes_made -eq 0 ]]; then
        echo "No more changes needed" | tee -a "$LOG_FILE"
        break
    fi
done

# Final count
remaining=$(find "$TARGET_DIR" -name "*[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*" | wc -l)
echo "=== FINAL RESULT ===" | tee -a "$LOG_FILE"
echo "Remaining files/dirs with hashes: $remaining" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"

if [[ $remaining -eq 0 ]]; then
    echo "✅ SUCCESS: All hash suffixes removed!" | tee -a "$LOG_FILE"
else
    echo "⚠️  WARNING: $remaining items still have hash suffixes" | tee -a "$LOG_FILE"
    echo "Remaining items:" | tee -a "$LOG_FILE"
    find "$TARGET_DIR" -name "*[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*" | head -10 | tee -a "$LOG_FILE"
fi