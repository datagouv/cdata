#!/usr/bin/env python3
import os
import re
import sys

def detect_irregular_whitespace(file_path):
    """Detect irregular whitespace characters in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        irregular_chars = [
            '\u00A0',  # NO-BREAK SPACE
            '\u200B',  # ZERO WIDTH SPACE
            '\u200C',  # ZERO WIDTH NON-JOINER
            '\u200D',  # ZERO WIDTH JOINER
            '\u2060',  # WORD JOINER
            '\uFEFF',  # ZERO WIDTH NO-BREAK SPACE
            '\u2028',  # LINE SEPARATOR
            '\u2029',  # PARAGRAPH SEPARATOR
            '\u1680',  # OGHAM SPACE MARK
            '\u180E',  # MONGOLIAN VOWEL SEPARATOR
            '\u2000',  # EN QUAD
            '\u2001',  # EM QUAD
            '\u2002',  # EN SPACE
            '\u2003',  # EM SPACE
            '\u2004',  # THREE-PER-EM SPACE
            '\u2005',  # FOUR-PER-EM SPACE
            '\u2006',  # SIX-PER-EM SPACE
            '\u2007',  # FIGURE SPACE
            '\u2008',  # PUNCTUATION SPACE
            '\u2009',  # THIN SPACE
            '\u200A',  # HAIR SPACE
            '\u202F',  # NARROW NO-BREAK SPACE
            '\u205F',  # MEDIUM MATHEMATICAL SPACE
            '\u3000',  # IDEOGRAPHIC SPACE
        ]
        
        found_issues = []
        for line_num, line in enumerate(lines, 1):
            for char in irregular_chars:
                if char in line:
                    found_issues.append({
                        'line': line_num,
                        'char': char,
                        'char_code': f'U+{ord(char):04X}',
                        'content': repr(line.strip())
                    })
        
        if found_issues:
            print(f"\nFile: {file_path}")
            for issue in found_issues:
                print(f"  Line {issue['line']}: {issue['char_code']} - {issue['content']}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def fix_irregular_whitespace(file_path):
    """Fix irregular whitespace characters in a specific file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Comprehensive list of irregular whitespace characters
        irregular_chars = [
            '\u00A0',  # NO-BREAK SPACE
            '\u200B',  # ZERO WIDTH SPACE
            '\u200C',  # ZERO WIDTH NON-JOINER
            '\u200D',  # ZERO WIDTH JOINER
            '\u2060',  # WORD JOINER
            '\uFEFF',  # ZERO WIDTH NO-BREAK SPACE
            '\u2028',  # LINE SEPARATOR
            '\u2029',  # PARAGRAPH SEPARATOR
            '\u1680',  # OGHAM SPACE MARK
            '\u180E',  # MONGOLIAN VOWEL SEPARATOR
            '\u2000',  # EN QUAD
            '\u2001',  # EM QUAD
            '\u2002',  # EN SPACE
            '\u2003',  # EM SPACE
            '\u2004',  # THREE-PER-EM SPACE
            '\u2005',  # FOUR-PER-EM SPACE
            '\u2006',  # SIX-PER-EM SPACE
            '\u2007',  # FIGURE SPACE
            '\u2008',  # PUNCTUATION SPACE
            '\u2009',  # THIN SPACE
            '\u200A',  # HAIR SPACE
            '\u202F',  # NARROW NO-BREAK SPACE
            '\u205F',  # MEDIUM MATHEMATICAL SPACE
            '\u3000',  # IDEOGRAPHIC SPACE
        ]
        
        for char in irregular_chars:
            content = content.replace(char, ' ')
        
        # Also fix any remaining irregular whitespace with regex
        content = re.sub(r'[\u00A0\u200B\u200C\u200D\u2060\uFEFF\u2028\u2029\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]', ' ', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # All files from all previous scripts combined
    all_files = [
        'components/Dataservices/AdminDataservicesPage.vue',
        'components/Dataservices/DescribeDataservice.vue',
        'components/Datasets/AdminDatasetsPage.vue',
        'components/Harvesters/AdminHarvestersPage.vue',
        'components/Reuses/AdminReusesPage.vue',
        'components/Reuses/DescribeReuse.vue',
        'components/Search/NoResults.vue',
        'datagouv-components/src/components/DatasetInformationPanel.vue',
        'datagouv-components/src/components/ResourceAccordion/Metadata.vue',
        'datagouv-components/src/components/ResourceAccordion/SchemaBadge.vue',
        'datagouv-components/src/components/StatBox.vue',
        'pages/admin/site/organizations.vue',
        'pages/admin/site/posts.vue',
        'pages/admin/site/topics.vue',
        'pages/admin/site/users.vue',
        'pages/datasets/[did]/index.vue',
        'pages/support/[...path].vue',
        
        # From detect_whitespace.py
        'components/Dataservices/AdminDataservicesPage.vue',
        'components/Dataservices/DescribeDataservice.vue',
        'components/Datasets/AdminDatasetsPage.vue',
        'components/Harvesters/AdminHarvestersPage.vue'
    ]
    
    # Remove duplicates and sort
    unique_files = sorted(list(set(all_files)))
    
    print(f"Checking {len(unique_files)} unique files for irregular whitespace...")
    
    # Check if user wants to detect only or fix
    if len(sys.argv) > 1 and sys.argv[1] == '--detect-only':
        print("\n=== DETECTION MODE ===")
        found_any = False
        for file_path in unique_files:
            if os.path.exists(file_path):
                if detect_irregular_whitespace(file_path):
                    found_any = True
            else:
                print(f"File not found: {file_path}")
        
        if not found_any:
            print("No irregular whitespace found in checked files")
    else:
        print("\n=== FIX MODE ===")
        fixed_count = 0
        for file_path in unique_files:
            if os.path.exists(file_path):
                if fix_irregular_whitespace(file_path):
                    fixed_count += 1
            else:
                print(f"File not found: {file_path}")
        
        print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main() 