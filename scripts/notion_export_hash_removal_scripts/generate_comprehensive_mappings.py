#!/usr/bin/env python3
"""
Generate comprehensive mappings by analyzing the directory structure
and identifying files/directories with hash suffixes.
"""

import os
import re
from pathlib import Path
from typing import Dict, Set
import urllib.parse

def find_hash_pattern_in_name(name: str) -> str:
    """Extract hash pattern from filename/dirname."""
    # Look for common hash patterns at the end
    patterns = [
        r'[0-9a-f]{32}$',  # 32-char hex hash
        r'[0-9a-f]{40}$',  # 40-char hex hash  
        r'[0-9a-f]{8,64}$', # Variable length hex hash
    ]
    
    for pattern in patterns:
        match = re.search(r'\s+' + pattern, name)
        if match:
            return match.group(0).strip()
    return ""

def generate_mappings(base_dir: str) -> Dict[str, str]:
    """Generate mappings by finding files with hash suffixes."""
    base_path = Path(base_dir)
    mappings = {}
    
    # Get all files and directories
    all_items = []
    for root, dirs, files in os.walk(base_path):
        for d in dirs:
            all_items.append(Path(root) / d)
        for f in files:
            all_items.append(Path(root) / f)
    
    for item_path in all_items:
        item_name = item_path.name
        
        # Check if this item has a hash suffix
        hash_suffix = find_hash_pattern_in_name(item_name)
        if hash_suffix:
            # Generate the clean name by removing the hash
            clean_name = item_name.replace(' ' + hash_suffix, '')
            
            # Create full paths
            old_full_path = str(item_path)
            new_full_path = str(item_path.parent / clean_name)
            
            mappings[old_full_path] = new_full_path
            
            print(f"Found mapping: {item_name} -> {clean_name}")
    
    return mappings

def analyze_markdown_links(base_dir: str) -> Set[str]:
    """Analyze all markdown files to find what paths they link to."""
    base_path = Path(base_dir)
    linked_paths = set()
    
    for md_file in base_path.rglob("*.md"):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all markdown links
            link_pattern = r'!\[.*?\]\(([^)]+)\)|\[.*?\]\(([^)]+)\)'
            matches = re.findall(link_pattern, content)
            
            for match in matches:
                link_url = match[0] or match[1]  # Get the non-empty group
                
                # Skip external URLs
                if link_url.startswith(('http://', 'https://')):
                    continue
                
                # URL decode
                try:
                    decoded_url = urllib.parse.unquote(link_url)
                    linked_paths.add(decoded_url)
                except:
                    linked_paths.add(link_url)
                    
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    return linked_paths

def save_mappings(mappings: Dict[str, str], output_file: str):
    """Save mappings to file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"# Comprehensive mapping generated\n")
        for old_path, new_path in mappings.items():
            f.write(f"OLD: {old_path}\n")
            f.write(f"NEW: {new_path}\n")
            f.write("---\n")

def main():
    base_dir = "/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/references_deprecated/제품서비스매뉴얼_20250714"
    
    print("Analyzing directory structure...")
    mappings = generate_mappings(base_dir)
    print(f"Generated {len(mappings)} mappings")
    
    print("\nAnalyzing markdown links...")
    linked_paths = analyze_markdown_links(base_dir)
    print(f"Found {len(linked_paths)} unique links in markdown files")
    
    # Show some examples of what's linked
    print("\nExample linked paths:")
    for i, path in enumerate(list(linked_paths)[:10]):
        print(f"  {i+1}: {path}")
    
    # Save comprehensive mappings
    output_file = "/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/comprehensive_mapping.txt"
    save_mappings(mappings, output_file)
    print(f"\nSaved comprehensive mappings to: {output_file}")

if __name__ == "__main__":
    main()