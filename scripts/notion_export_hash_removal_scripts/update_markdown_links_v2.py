#!/usr/bin/env python3
"""
Enhanced markdown link updater that handles hash suffix removal comprehensively.

This version:
1. Uses comprehensive mappings from directory analysis
2. Handles partial path matching for relative links
3. Supports both simple filename and complex directory path updates
4. Provides detailed logging of all changes
"""

import os
import re
import shutil
import urllib.parse
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Set
from datetime import datetime

# Setup logging
log_filename = f"link_update_v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EnhancedMarkdownLinkUpdater:
    def __init__(self, base_dir: str, mapping_file: str):
        self.base_dir = Path(base_dir)
        self.mapping_file = Path(mapping_file)
        self.mappings = {}
        self.reverse_mappings = {}  # Map clean names to original paths
        self.name_mappings = {}     # Map just filenames/dirnames
        self.backup_dir = None
        self.changes_made = 0
        self.files_processed = 0
        
    def load_mappings(self) -> None:
        """Load comprehensive path mappings."""
        logger.info("Loading comprehensive path mappings...")
        
        if not self.mapping_file.exists():
            logger.error(f"Mapping file not found: {self.mapping_file}")
            return
            
        try:
            with open(self.mapping_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            current_old = None
            for line in lines:
                line = line.strip()
                if line.startswith('OLD: '):
                    current_old = line[5:]  # Remove 'OLD: ' prefix
                elif line.startswith('NEW: ') and current_old:
                    current_new = line[5:]  # Remove 'NEW: ' prefix
                    self.mappings[current_old] = current_new
                    
                    # Build reverse mappings for lookup
                    self.reverse_mappings[current_new] = current_old
                    
                    # Build name-only mappings
                    old_name = Path(current_old).name
                    new_name = Path(current_new).name
                    if old_name != new_name:
                        self.name_mappings[old_name] = new_name
                    
                    current_old = None
                    
        except Exception as e:
            logger.error(f"Error loading mapping file {self.mapping_file}: {e}")
            return
        
        logger.info(f"Loaded {len(self.mappings)} comprehensive mappings")
        logger.info(f"Generated {len(self.name_mappings)} name-only mappings")
        
        # Log some examples
        for i, (old_path, new_path) in enumerate(list(self.mappings.items())[:3]):
            old_name = Path(old_path).name
            new_name = Path(new_path).name
            logger.info(f"Example {i+1}: '{old_name}' -> '{new_name}'")
    
    def create_backup(self) -> None:
        """Create backup of the entire directory before making changes."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.backup_dir = self.base_dir.parent / f"backup_v2_{self.base_dir.name}_{timestamp}"
        
        logger.info(f"Creating backup at: {self.backup_dir}")
        try:
            shutil.copytree(self.base_dir, self.backup_dir)
            logger.info("Backup created successfully")
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            raise
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files in the target directory."""
        md_files = list(self.base_dir.rglob("*.md"))
        logger.info(f"Found {len(md_files)} markdown files to process")
        return md_files
    
    def normalize_path(self, path: str) -> str:
        """Normalize path for comparison."""
        # URL decode first
        try:
            decoded = urllib.parse.unquote(path)
        except:
            decoded = path
        
        # Normalize path separators
        normalized = decoded.replace('\\', '/')
        
        # Remove leading ./ 
        if normalized.startswith('./'):
            normalized = normalized[2:]
        
        return normalized
    
    def find_matching_clean_path(self, original_path: str) -> str:
        """Find the clean version of a path with hash suffix."""
        normalized = self.normalize_path(original_path)
        
        # Try exact match first (for full paths)
        for old_path, new_path in self.mappings.items():
            old_relative = str(Path(old_path).relative_to(self.base_dir))
            new_relative = str(Path(new_path).relative_to(self.base_dir))
            
            old_normalized = self.normalize_path(old_relative)
            new_normalized = self.normalize_path(new_relative)
            
            if normalized == old_normalized:
                return new_normalized
        
        # Try name-only matching
        path_parts = normalized.split('/')
        if path_parts:
            last_part = path_parts[-1]
            if last_part in self.name_mappings:
                # Replace just the last part
                path_parts[-1] = self.name_mappings[last_part]
                return '/'.join(path_parts)
        
        # Try partial matching - check if any part of the path has a hash suffix
        modified = False
        new_parts = []
        
        for part in path_parts:
            # Check if this part matches any of our mappings
            clean_part = part
            for old_name, new_name in self.name_mappings.items():
                if part == old_name:
                    clean_part = new_name
                    modified = True
                    break
            new_parts.append(clean_part)
        
        if modified:
            return '/'.join(new_parts)
        
        # No match found
        return original_path
    
    def extract_hash_from_name(self, name: str) -> str:
        """Extract hash suffix from a name if present."""
        # Look for common hash patterns at the end
        patterns = [
            r'\s+[0-9a-f]{32}$',  # 32-char hex hash
            r'\s+[0-9a-f]{40}$',  # 40-char hex hash  
            r'\s+[0-9a-f]{8,64}$', # Variable length hex hash
        ]
        
        for pattern in patterns:
            match = re.search(pattern, name)
            if match:
                return match.group(0).strip()
        return ""
    
    def remove_hash_from_path(self, path: str) -> str:
        """Remove hash suffixes from path components."""
        normalized = self.normalize_path(path)
        path_parts = normalized.split('/')
        
        modified = False
        new_parts = []
        
        for part in path_parts:
            # Check if this part has a hash suffix
            hash_suffix = self.extract_hash_from_name(part)
            if hash_suffix:
                clean_part = part.replace(' ' + hash_suffix, '')
                new_parts.append(clean_part)
                modified = True
            else:
                new_parts.append(part)
        
        if modified:
            return '/'.join(new_parts)
        return path
    
    def update_links_in_content(self, content: str, file_path: Path) -> Tuple[str, int]:
        """Update all links in markdown content."""
        changes_count = 0
        
        # Pattern to match markdown links: [text](path) and ![alt](path)
        link_pattern = r'(!?\[.*?\])\(([^)]+)\)'
        
        def replace_link(match):
            nonlocal changes_count
            link_text = match.group(1)
            link_url = match.group(2)
            
            # Skip external URLs, data URLs, and anchors
            if link_url.startswith(('http://', 'https://', 'data:', '#')):
                return match.group(0)
            
            # Try to find a clean version of this path
            original_url = link_url
            
            # Method 1: Use comprehensive mappings
            clean_url = self.find_matching_clean_path(link_url)
            
            # Method 2: If no mapping found, try pattern-based hash removal
            if clean_url == link_url:
                clean_url = self.remove_hash_from_path(link_url)
            
            # If we found a cleaner version, use it
            if clean_url != original_url:
                # URL encode the new path if it contains special characters
                try:
                    if any(ord(c) > 127 or c in ' ()' for c in clean_url):
                        encoded_url = urllib.parse.quote(clean_url, safe='/')
                    else:
                        encoded_url = clean_url
                except:
                    encoded_url = clean_url
                
                changes_count += 1
                logger.info(f"  Link update: '{original_url}' -> '{encoded_url}'")
                return f"{link_text}({encoded_url})"
            
            return match.group(0)
        
        updated_content = re.sub(link_pattern, replace_link, content)
        return updated_content, changes_count
    
    def process_file(self, file_path: Path) -> None:
        """Process a single markdown file."""
        logger.info(f"Processing: {file_path.relative_to(self.base_dir)}")
        
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # Update links
            updated_content, file_changes = self.update_links_in_content(original_content, file_path)
            
            # Write back if changes were made
            if file_changes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                logger.info(f"  Updated {file_changes} links in {file_path.name}")
                self.changes_made += file_changes
            else:
                logger.info(f"  No changes needed in {file_path.name}")
                
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
    
    def process_all_files(self) -> None:
        """Process all markdown files."""
        md_files = self.find_markdown_files()
        
        logger.info("Starting to process markdown files...")
        
        for file_path in md_files:
            self.process_file(file_path)
            self.files_processed += 1
        
        logger.info(f"Processing complete! Updated {self.changes_made} links across {self.files_processed} files")
    
    def run(self) -> None:
        """Run the complete link update process."""
        logger.info("=== Enhanced Markdown Link Updater Started ===")
        logger.info(f"Base directory: {self.base_dir}")
        logger.info(f"Mapping file: {self.mapping_file}")
        
        try:
            # Load mappings
            self.load_mappings()
            
            if not self.mappings:
                logger.warning("No mappings loaded. Nothing to update.")
                return
            
            # Create backup
            self.create_backup()
            
            # Process all files
            self.process_all_files()
            
            # Final summary
            logger.info("=== Update Summary ===")
            logger.info(f"Files processed: {self.files_processed}")
            logger.info(f"Total links updated: {self.changes_made}")
            logger.info(f"Backup created at: {self.backup_dir}")
            logger.info(f"Log file: {log_filename}")
            
        except Exception as e:
            logger.error(f"Fatal error: {e}")
            raise

def main():
    """Main function."""
    # Configuration
    base_dir = "/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/references_deprecated/제품서비스매뉴얼_20250714"
    mapping_file = "/mnt/d/Downloads/new_kvidai-documentation/kvidai-documentation/comprehensive_mapping.txt"
    
    # Create and run updater
    updater = EnhancedMarkdownLinkUpdater(base_dir, mapping_file)
    updater.run()

if __name__ == "__main__":
    main()