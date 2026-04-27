#!/usr/bin/env python3
import pathlib

f = pathlib.Path('/home/zhuwankai/weiwuweixin/apps/web/src/app/[locale]/page.tsx')
text = f.read_text()

# Check for key markers of the new version
has_isActive = 'isActive' in text
has_0a0808 = '#0a0808' in text or '0a0808' in text
has_outer_glow = 'LENS_SIZE * 1.8' in text
has_metal_ring = '金属框' in text
has_restSpeed = 'restSpeed' in text

print(f"has_isActive: {has_isActive}")
print(f"has_0a0808: {has_0a0808}")
print(f"has_outer_glow: {has_outer_glow}")
print(f"has_metal_ring: {has_metal_ring}")
print(f"has_restSpeed: {has_restSpeed}")

# Show the active/inactive background
if 'isActive' in text:
    # Find the background line
    idx = text.find("background: isActive")
    if idx > 0:
        chunk = text[idx:idx+300]
        print(f"\nBackground lines:\n{chunk[:300]}")