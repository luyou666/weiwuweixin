#!/usr/bin/env python3
"""Update LensCursor: make it more responsive and realistic"""
import pathlib

f = pathlib.Path('/home/zhuwankai/weiwuweixin/apps/web/src/app/[locale]/page.tsx')
text = f.read_text()

# 1. Make spring more responsive (reduce lag)
text = text.replace(
    "transition={{ type: 'spring', stiffness: 600, damping: 30, mass: 0.12 }}",
    "transition={{ type: 'spring', stiffness: 1200, damping: 40, mass: 0.08, restSpeed: 0.01 }}"
)

# 2. Make active background slightly more opaque to better "replace" Chinese text
#    (transparent -> slight dark tint so English is more readable)
text = text.replace(
    """          background: isActive
            ? 'transparent'
            : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 70%, transparent 100%)'""",
    """          background: isActive
            ? 'radial-gradient(circle at 50% 50%, rgba(10,8,6,0.7) 0%, rgba(10,8,6,0.4) 70%, transparent 100%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 70%, transparent 100%)'"""
)

# 3. Improve active backdrop-filter: keep subtle glass effect when active
text = text.replace(
    """          backdropFilter: isActive
            ? 'brightness(1.05)'
            : 'brightness(1.8) saturate(1.4)',
          WebkitBackdropFilter: isActive
            ? 'brightness(1.05)'
            : 'brightness(1.8) saturate(1.4)'""",
    """          backdropFilter: isActive
            ? 'blur(1px) brightness(1.1) saturate(1.1)'
            : 'brightness(1.6) saturate(1.5)',
          WebkitBackdropFilter: isActive
            ? 'blur(1px) brightness(1.1) saturate(1.1)'
            : 'brightness(1.6) saturate(1.5)'"""
)

# 4. Make border more prominent when active (metallic feel)
text = text.replace(
    """          border: isActive
            ? '2.5px solid rgba(255,255,255,0.22)'
            : '1.5px solid rgba(255,255,255,0.3)'""",
    """          border: isActive
            ? '3px solid rgba(255,255,255,0.18)'
            : '1.5px solid rgba(255,255,255,0.3)'"""
)

# 5. More dramatic box-shadow when active (deeper glass effect)
text = text.replace(
    """            0 10px 40px rgba(0,0,0,0.45),
            0 0 0 4px rgba(255,255,255,0.02),
            inset 0 0 ${isActive ? '30' : '40'}px rgba(255,255,255,0.04)""",
    """            0 14px 52px rgba(0,0,0,0.55),
            0 0 ${isActive ? '60' : '30'}px rgba(226,85,63,0.1),
            0 0 0 4px rgba(255,255,255,0.02),
            inset 0 0 ${isActive ? '30' : '40'}px rgba(255,255,255,0.04)"""
)

# 6. English text: more visible and slightly larger
text = text.replace(
    """                  color: '#f5f0eb',
                  fontWeight: 300,
                  letterSpacing: '0.06em',
                  textShadow: '0 0 24px rgba(226,85,63,0.12), 0 1px 3px rgba(0,0,0,0.5)',""",
    """                  color: '#f5f0eb',
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                  textShadow: '0 0 30px rgba(226,85,63,0.2), 0 1px 4px rgba(0,0,0,0.7)',"""
)

# 7. Lens centering - remove scale: 1.1 when active (it's distracting)
text = text.replace(
    """        left: isActive ? centerX : mousePx.x,
        top: isActive ? centerY : mousePx.y,
        scale: isActive ? 1.1 : 1,""",
    """        left: isActive ? centerX : mousePx.x,
        top: isActive ? centerY : mousePx.y,
        scale: isActive ? 1.05 : 1,"""
)

f.write_text(text)
print("SUCCESS: LensCursor updated with more responsive spring and realistic effects")