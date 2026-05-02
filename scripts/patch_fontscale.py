#!/usr/bin/env python3
"""Patch ShareCard.tsx to support fontSizeScale prop"""
import re

PATH = '/home/zhuwankai/weiwuweixin/packages/ui/src/components/ShareCard.tsx'

with open(PATH, 'r') as f:
    content = f.read()
    lines = content.split('\n')

# ============================
# STEP 1: Add fontSizeScale to ShareCardProps
# ============================
for i, line in enumerate(lines):
    if '/** 画布宽度（像素）' in line:
        # Insert before this line
        lines.insert(i, '  /** 字号缩放倍率，默认 1.0（范围 0.5~2.0） */')
        lines.insert(i+1, '  fontSizeScale?: number;')
        lines.insert(i+2, '')
        break

# ============================
# STEP 2: DataMatrixLayout - add fontSizeScale param
# ============================
for i, line in enumerate(lines):
    if line.strip().startswith('function DataMatrixLayout('):
        # Next few lines: find "data, orientation, theme,"
        for j in range(i+1, min(i+5, len(lines))):
            if 'data, orientation, theme,' in lines[j]:
                lines[j] = lines[j].replace(
                    'data, orientation, theme,',
                    'data, orientation, theme, fontSizeScale = 1,'
                )
                break
        # Add type for fontSizeScale
        for j in range(i+5, min(i+20, len(lines))):
            if 'theme: typeof THEMES' in lines[j]:
                # The next line should be "}) {"
                for k in range(j, min(j+5, len(lines))):
                    if '})' in lines[k]:
                        lines.insert(k, '  fontSizeScale?: number;')
                        break
                break
        break

# ============================
# STEP 3: Add 'const s = fontSizeScale ?? 1;' after 'const t = theme;'
# ============================
for i, line in enumerate(lines):
    if line.strip() == 'const t = theme;':
        lines.insert(i+1, '  const s = fontSizeScale ?? 1;')
        break

# ============================
# STEP 4: HyperMatrixLayout - add fontSizeScale param
# ============================
for i, line in enumerate(lines):
    if line.strip().startswith('function HyperMatrixLayout('):
        for j in range(i+1, min(i+5, len(lines))):
            if 'data, orientation,' in lines[j] and 'fontSizeScale' not in lines[j]:
                lines[j] = '  data, orientation, fontSizeScale = 1,'
                break
        for j in range(i+5, min(i+15, len(lines))):
            if '}' in lines[j] and '})' in lines[j]:
                idx = lines[j].index('})')
                lines[j] = lines[j][:idx] + '  fontSizeScale?: number;\n' + lines[j][idx:]
                break
        break

# ============================
# STEP 5: Add 'const s = fontSizeScale ?? 1;' after isPortrait
# ============================
for i, line in enumerate(lines):
    if 'function HyperMatrixLayout' in line:
        for j in range(i, min(i+25, len(lines))):
            if 'const w = isPortrait' in lines[j] and 'const s' not in lines[j-1]:
                lines.insert(j, '  const s = fontSizeScale ?? 1;')
                break
        break

# ============================
# STEP 6: All 12 wrapper functions
# ============================
wrapper_names = ['RiceInkCard', 'MorandiCard', 'CyberNeonCard', 'RetroMagazineCard',
                 'MinimalWhiteCard', 'StickerJournalCard', 'GlassMorphismCard', 'BrutalistCard',
                 'PaperFoldCard', 'CosmicDustCard', 'VaporwaveCard', 'GridPosterCard']

for name in wrapper_names:
    for i, line in enumerate(lines):
        if f'function {name}(' in line:
            # Replace the parameter and type
            lines[i] = lines[i].replace(
                '{ data, orientation }: { data: ShareCardData; orientation: CardOrientation }',
                '{ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }'
            )
            # Replace in the JSX
            for j in range(i+1, min(i+3, len(lines))):
                if 'orientation={orientation}' in lines[j]:
                    lines[j] = lines[j].replace(
                        'orientation={orientation}',
                        'orientation={orientation} fontSizeScale={fontSizeScale}'
                    )
            break

# ============================
# STEP 7: DataTableauCard
# ============================
for i, line in enumerate(lines):
    if 'function DataTableauCard(' in line:
        lines[i] = lines[i].replace(
            '{ data, orientation }: { data: ShareCardData; orientation: CardOrientation }',
            '{ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }'
        )
        for j in range(i+1, min(i+3, len(lines))):
            if 'orientation={orientation}' in lines[j]:
                lines[j] = lines[j].replace(
                    'orientation={orientation}',
                    'orientation={orientation} fontSizeScale={fontSizeScale}'
                )
        break

# ============================
# STEP 8: TEMPLATE_MAP type
# ============================
for i, line in enumerate(lines):
    if 'const TEMPLATE_MAP' in line and 'Record' in line:
        lines[i] = lines[i].replace(
            '{ data: ShareCardData; orientation: CardOrientation }',
            '{ data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }'
        )
        break

# ============================
# STEP 9: ShareCard main component
# ============================
for i, line in enumerate(lines):
    if 'export function ShareCard(' in line:
        lines[i] = lines[i].replace(
            '{ template, orientation, data, width, height, accentHue = 0 }',
            '{ template, orientation, data, width, height, accentHue = 0, fontSizeScale = 1 }'
        )
        break

for i, line in enumerate(lines):
    if '<Template data={data} orientation={orientation} />' in line:
        lines[i] = lines[i].replace(
            'orientation={orientation} />',
            'orientation={orientation} fontSizeScale={fontSizeScale} />'
        )
        break

# ============================
# STEP 10: Multiply ALL fontSize values by s
# ============================
font_pat = re.compile(r'(fontSize:)\s*(\(?isPortrait\s*\?.*?)\)?\s*([,;\}\n\)])')

new_lines = []
for line in lines:
    if 'fontSize:' in line and 'isPortrait' in line and '* s' not in line and 'fontSizeScale' not in line:
        # Wrap the ternary expression with * s
        def replacer(m):
            prefix = m.group(1)  # "fontSize:"
            expr = m.group(2).strip()
            suffix = m.group(3)
            # Remove extra parentheses if any
            expr_clean = expr.strip('()').strip()
            return f'{prefix} ({expr_clean}) * s{suffix}'
        line = font_pat.sub(replacer, line)
    new_lines.append(line)

lines = new_lines

# ============================
# WRITE BACK
# ============================
new_content = '\n'.join(lines)
with open(PATH, 'w') as f:
    f.write(new_content)

# ============================
# VERIFY
# ============================
with open(PATH, 'r') as f:
    vcontent = f.read()
vlines = vcontent.split('\n')

print(f"Total lines: {len(vlines)}")
print(f"'fontSizeScale' found: {sum(1 for l in vlines if 'fontSizeScale' in l)} times")
print(f"'* s' found: {sum(1 for l in vlines if '* s' in l and 'fontSize' in l)} times")

# Check for any fontSize still without * s
for i, line in enumerate(vlines, 1):
    if 'fontSize:' in line and 'isPortrait' in line and '* s' not in line and 'fontSizeScale' not in line:
        print(f"WARNING L{i} MISSING *s: {line.strip()[:100]}")

# Show ShareCardProps
for i, line in enumerate(vlines, 1):
    if 'ShareCardProps' in line and 'interface' in line:
        print(f"\n=== ShareCardProps ===")
        for j in range(i, min(i+12, len(vlines))):
            print(f"  L{j}: {vlines[j-1]}")
        break

print("\n✅ Done!")
