#!/usr/bin/env python3
"""Batch fix remaining fixed values in ShareCard.tsx that should scale with fontSize"""

import re

PATH = '/home/zhuwankai/weiwuweixin/packages/ui/src/components/ShareCard.tsx'

with open(PATH, 'r') as f:
    content = f.read()

# Define replacements (old → new)
# Format: (line_match_pattern, replacement_pattern)
# We'll use regex to match and replace

patches = [
    # --- DataMatrixLayout ---
    # L524: accent bar width
    (r'width: isPortrait \? 3 : 2,', r'width: (isPortrait ? 3 : 2) * s,'),
    # L525: accent bar height (next to title)
    (r'height: isPortrait \? 44 : 24,\n\s+background:', r"height: (isPortrait ? 44 : 24) * s,\n            background:"),
    # L558: gap in algorithm badge
    (r"(fontFamily: t\.titleFont,\n\s+)\}\}>\n\s+<span style=\{\{\n\s+fontSize: \(isPortrait \? 9 : 6\) \* s,\n\s+color: t\.textSecondary,\n\s+fontWeight: 700,\n\s+fontFamily: \\\"'JetBrains Mono', monospace\\\",\n\s+letterSpacing: 2,\n\s+padding: isPortrait \? '0 10px' : '0 6px',\n\s+borderRadius: 20,\n\s+background: t\.cardBg,\n\s+border: `1px solid \$\{t\.divider\}`,", r"\g<1>}}>\n            <span style={{\n              fontSize: (isPortrait ? 9 : 6) * s,\n              color: t.textSecondary,\n              fontWeight: 700,\n              fontFamily: \"'JetBrains Mono', monospace\",\n              letterSpacing: (2) * s,\n              padding: isPortrait ? '0 10px' : '0 6px',\n              borderRadius: 20,\n              gap: (4) * s,\n              background: t.cardBg,\n              border: `1px solid ${t.divider}`,"),
    # L605: gap in table header
    (r"(alignItems: 'center',) gap: 2,", r"\1 gap: (2) * s,"),
    # L716: progress bar height
    (r"height: isPortrait \? 4 : 2,", r"height: (isPortrait ? 4 : 2) * s,"),
    # L766: author avatar width
    (r"(borderRadius: '50%',) \\n\s+width: isPortrait \? 32 : 20,", r"\1\n            width: (isPortrait ? 32 : 20) * s,"),
    # L767: author avatar height
    (r"(width: \(isPortrait \? 32 : 20\) \* s,) \\n\s+height: isPortrait \? 32 : 20,", r"\1\n            height: (isPortrait ? 32 : 20) * s,"),
    # L778: letterSpacing for author info
    (r"(color: t\.textSecondary,) letterSpacing: 1,\n(\s+fontFamily: t\.fontFamily)", r"\1 letterSpacing: 1 * s,\n\2"),
    # L786: letterSpacing for watermark
    (r"(color: t\.textMuted,) letterSpacing: 2,", r"\1 letterSpacing: (2) * s,"),
    
    # --- HyperMatrixLayout ---
    # L867: divider height
    (r"height: isPortrait \? 2 : 1,", r"height: (isPortrait ? 2 : 1) * s,"),
    # L1019: gap in HM table header
    (r"gap: 1,\n(\s+alignItems)", r"gap: (1) * s,\n\1"),
    # L1222: author avatar width HM
    (r"(borderRadius: '50%')},\n\s+style=\{\{\n\s+width: isPortrait \? 28 : 16,", r"\1},\n              style={{\n              width: (isPortrait ? 28 : 16) * s,"),
    # L1223: author avatar height HM
    (r"(width: \(isPortrait \? 28 : 16\) \* s,) \n\s+height: isPortrait \? 28 : 16,", r"\1\n              height: (isPortrait ? 28 : 16) * s,"),
]

# Simpler approach: just do targeted string replacements
# Let me do this more carefully by reading the file and doing specific line replacements

# Actually, let me do this via a simpler approach - modify specific lines
lines = content.split('\n')

replacements = {
    # (1-indexed line number, old_substring, new_substring)
    # or we can use regex

}

# More robust: find patterns by context and replace
new_lines = []
i = 0
count = 0

while i < len(lines):
    line = lines[i]
    
    # L524: width: isPortrait ? 3 : 2,
    if re.search(r'width:\s*isPortrait\s*\?\s*3\s*:\s*2\s*,', line) and '* s' not in line:
        line = re.sub(r'width:\s*(isPortrait\s*\?\s*3\s*:\s*2)\s*,', r'width: (\1) * s,', line)
        count += 1
    
    # L525: height: isPortrait ? 44 : 24,
    if re.search(r'height:\s*isPortrait\s*\?\s*44\s*:\s*24\s*,', line) and '* s' not in line:
        line = re.sub(r'height:\s*(isPortrait\s*\?\s*44\s*:\s*24)\s*,', r'height: (\1) * s,', line)
        count += 1
    
    # gap: 4  (in padding block with borderRadius 20 — DataMatrixLayout algorithm badge)
    if re.search(r'^\s+gap:\s*4\s*,?\s*$', line) and '* s' not in line:
        # Need to verify this is inside DataMatrixLayout or HyperMatrixLayout
        # Check surrounding context
        if i > 400 and i < 1300:
            line = line.replace('gap: 4', 'gap: (4) * s')
            count += 1
    
    # gap: 2 (table header)
    if re.search(r'^\s+gap:\s*2\s*,?\s*$', line) and '* s' not in line:
        if i > 400 and i < 795:  # DataMatrixLayout range
            line = line.replace('gap: 2,', 'gap: (2) * s,')
            count += 1
        elif i > 795 and i < 1300:  # HyperMatrixLayout
            line = line.replace('gap: 2,', 'gap: (2) * s,')
            count += 1
    
    # gap: 1 (HM table header)
    if re.search(r'^\s+gap:\s*1\s*,?\s*$', line) and '* s' not in line:
        if i > 795:
            line = line.replace('gap: 1,', 'gap: (1) * s,')
            count += 1
    
    # height: isPortrait ? 4 : 2 — progress bar
    if re.search(r'height:\s*isPortrait\s*\?\s*4\s*:\s*2\s*,', line) and '* s' not in line:
        line = re.sub(r'height:\s*(isPortrait\s*\?\s*4\s*:\s*2)\s*,', r'height: (\1) * s,', line)
        count += 1
    
    # height: isPortrait ? 2 : 1 — divider
    if re.search(r'height:\s*isPortrait\s*\?\s*2\s*:\s*1\s*,', line) and '* s' not in line:
        line = re.sub(r'height:\s*(isPortrait\s*\?\s*2\s*:\s*1)\s*,', r'height: (\1) * s,', line)
        count += 1
    
    # letterSpacing: 1, (in author info section, DataMatrixLayout footer)
    if re.search(r'letterSpacing:\s*1\s*,', line) and '* s' not in line and 'fontFamily' in line:
        line = re.sub(r'letterSpacing:\s*1\s*,', r'letterSpacing: (1) * s,', line)
        count += 1
    
    # letterSpacing: 2, (watermark)
    if re.search(r'letterSpacing:\s*2\s*,', line) and '* s' not in line and 'textMuted' in lines[i-1] if i > 0 else False:
        line = re.sub(r'letterSpacing:\s*2\s*,', r'letterSpacing: (2) * s,', line)
        count += 1
    
    # width: isPortrait ? 32 : 20 (author avatar)
    if re.search(r'width:\s*isPortrait\s*\?\s*32\s*:\s*20\s*,', line) and '* s' not in line:
        line = re.sub(r'width:\s*(isPortrait\s*\?\s*32\s*:\s*20)\s*,', r'width: (\1) * s,', line)
        count += 1
    
    # height: isPortrait ? 32 : 20 (author avatar)
    if re.search(r'height:\s*isPortrait\s*\?\s*32\s*:\s*20\s*,', line) and '* s' not in line:
        line = re.sub(r'height:\s*(isPortrait\s*\?\s*32\s*:\s*20)\s*,', r'height: (\1) * s,', line)
        count += 1
    
    # width: isPortrait ? 28 : 16 (author avatar HM)
    if re.search(r'width:\s*isPortrait\s*\?\s*28\s*:\s*16\s*,', line) and '* s' not in line:
        line = re.sub(r'width:\s*(isPortrait\s*\?\s*28\s*:\s*16)\s*,', r'width: (\1) * s,', line)
        count += 1
    
    # height: isPortrait ? 28 : 16 (author avatar HM)
    if re.search(r'height:\s*isPortrait\s*\?\s*28\s*:\s*16\s*,', line) and '* s' not in line:
        line = re.sub(r'height:\s*(isPortrait\s*\?\s*28\s*:\s*16)\s*,', r'height: (\1) * s,', line)
        count += 1
    
    new_lines.append(line)
    i += 1

print(f"Fixed {count} remaining values")

# Write back
with open(PATH, 'w') as f:
    f.write('\n'.join(new_lines))

# Verify
with open(PATH, 'r') as f:
    vlines = f.readlines()

print(f"\n=== Verification ===")
print(f"Total lines: {len(vlines)}")
# Count * s
s_count = sum(1 for l in vlines if '* s' in l)
print(f"'* s' count: {s_count}")

# Check for potential misses
for i, l in enumerate(vlines, 1):
    if 'gap:' in l and re.search(r'gap:\s*\d+\s*,', l) and '* s' not in l:
        print(f"  STILL FIXED gap L{i}: {l.strip()[:80]}")
    if 'letterSpacing:' in l and re.search(r'letterSpacing:\s*\d+\s*,', l) and '* s' not in l:
        print(f"  STILL FIXED letterSpacing L{i}: {l.strip()[:80]}")

print("\n✅ Done!")
