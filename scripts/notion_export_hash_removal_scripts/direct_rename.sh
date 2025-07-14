#!/bin/bash

# Direct approach to rename remaining files
set -euo pipefail

TARGET_DIR="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/references_deprecated/제품서비스매뉴얼_20250714"
MAPPING_FILE="/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/direct_mapping.txt"

echo "Starting direct rename process..."
echo "# Direct mapping generated on $(date)" > "$MAPPING_FILE"

count=0

# Process files first
echo "Processing files..."
find "$TARGET_DIR" -type f | while IFS= read -r file; do
    name=$(basename "$file")
    if [[ "$name" =~ \ [0-9a-f]{32}(\.[^.]*)?$ ]]; then
        dir_path=$(dirname "$file")
        new_name=$(echo "$name" | sed -E 's/ [0-9a-f]{32}(\.[^.]*)?$/\1/')
        new_path="$dir_path/$new_name"
        
        if [[ ! -e "$new_path" ]]; then
            if mv "$file" "$new_path" 2>/dev/null; then
                echo "Renamed file: $name -> $new_name"
                echo "OLD: $file" >> "$MAPPING_FILE"
                echo "NEW: $new_path" >> "$MAPPING_FILE"
                echo "---" >> "$MAPPING_FILE"
                ((count++))
            fi
        fi
    fi
done

echo "Processing directories..."
# Process directories (deepest first)
find "$TARGET_DIR" -type d | sort -r | while IFS= read -r dir; do
    if [[ "$dir" != "$TARGET_DIR" ]]; then
        name=$(basename "$dir")
        if [[ "$name" =~ \ [0-9a-f]{32}$ ]]; then
            parent_path=$(dirname "$dir")
            new_name=$(echo "$name" | sed -E 's/ [0-9a-f]{32}$//')
            new_path="$parent_path/$new_name"
            
            if [[ ! -e "$new_path" ]]; then
                if mv "$dir" "$new_path" 2>/dev/null; then
                    echo "Renamed dir: $name -> $new_name"
                    echo "OLD: $dir" >> "$MAPPING_FILE"
                    echo "NEW: $new_path" >> "$MAPPING_FILE"
                    echo "---" >> "$MAPPING_FILE"
                    ((count++))
                fi
            fi
        fi
    fi
done

echo "Direct rename completed!"

# Final verification
remaining=$(find "$TARGET_DIR" \( -type f -o -type d \) | grep -E ' [0-9a-f]{32}(\.[^.]*)?$' | wc -l)
echo "Remaining items with hash patterns: $remaining"