#!/usr/bin/env python3
"""
Final hash cleanup script - removes all hash suffixes from filenames in one go
This Python version is more reliable than bash for complex operations
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

def remove_hash_suffix(name):
    """Remove 32+ character hex hash suffix from filename/dirname"""
    # Pattern: space followed by 32+ hex characters, optionally followed by file extension
    pattern = r'\s+[0-9a-f]{32,}(\.[^.]*)?$'
    match = re.search(pattern, name)
    if match:
        # Keep the extension if it exists
        extension = match.group(1) if match.group(1) else ''
        new_name = name[:match.start()] + extension
        return new_name
    return None

def process_directory(target_dir):
    """Process all files and directories recursively"""
    target_path = Path(target_dir)
    if not target_path.exists():
        print(f"Error: Directory {target_dir} does not exist")
        return False
    
    changes_made = 0
    max_rounds = 10
    
    print(f"=== Starting hash removal process ===")
    print(f"Target: {target_dir}")
    print(f"Time: {datetime.now()}")
    
    for round_num in range(1, max_rounds + 1):
        print(f"\n=== Round {round_num} ===")
        round_changes = 0
        
        # Get all items with hash suffixes (files and directories)
        items_to_rename = []
        
        for root, dirs, files in os.walk(target_dir):
            # Check files
            for file in files:
                if re.search(r'\s+[0-9a-f]{32,}(\.[^.]*)?$', file):
                    items_to_rename.append(('file', os.path.join(root, file)))
            
            # Check directories
            for dir_name in dirs:
                if re.search(r'\s+[0-9a-f]{32,}$', dir_name):
                    items_to_rename.append(('dir', os.path.join(root, dir_name)))
        
        # Sort by depth (deepest first) to avoid path conflicts
        items_to_rename.sort(key=lambda x: x[1].count(os.sep), reverse=True)
        
        for item_type, item_path in items_to_rename:
            try:
                old_name = os.path.basename(item_path)
                new_name = remove_hash_suffix(old_name)
                
                if new_name and new_name != old_name:
                    parent_dir = os.path.dirname(item_path)
                    new_path = os.path.join(parent_dir, new_name)
                    
                    if not os.path.exists(new_path):
                        os.rename(item_path, new_path)
                        print(f"  RENAMED: {old_name} -> {new_name}")
                        round_changes += 1
                    else:
                        print(f"  SKIP: Target exists - {new_name}")
                        
            except Exception as e:
                print(f"  ERROR: {item_path} - {str(e)}")
        
        print(f"Round {round_num}: {round_changes} changes")
        changes_made += round_changes
        
        if round_changes == 0:
            print("No more changes needed")
            break
    
    # Final verification
    remaining_count = 0
    remaining_items = []
    
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if re.search(r'\s+[0-9a-f]{32,}(\.[^.]*)?$', file):
                remaining_count += 1
                remaining_items.append(os.path.join(root, file))
        
        for dir_name in dirs:
            if re.search(r'\s+[0-9a-f]{32,}$', dir_name):
                remaining_count += 1
                remaining_items.append(os.path.join(root, dir_name))
    
    print(f"\n=== FINAL RESULT ===")
    print(f"Total changes made: {changes_made}")
    print(f"Remaining items with hashes: {remaining_count}")
    
    if remaining_count == 0:
        print("✅ SUCCESS: All hash suffixes removed!")
        return True
    else:
        print("⚠️  WARNING: Some items still have hash suffixes")
        print("First 10 remaining items:")
        for item in remaining_items[:10]:
            print(f"  - {item}")
        return False

if __name__ == "__main__":
    target_directory = "/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/references_deprecated/제품서비스매뉴얼_20250714"
    success = process_directory(target_directory)
    sys.exit(0 if success else 1)