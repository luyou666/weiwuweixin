from PIL import Image, ImageDraw

img = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 深色圆角矩形背景
d.rounded_rectangle([8, 8, 248, 248], radius=48, fill='#1A1A24')
# 朱砂红内圆 — 代表"心"
d.ellipse([58, 58, 198, 198], fill='#E2553F')
# "围" 字
d.text((90, 100), '围', fill='#FBF7F0')

img.save('assets/icon.png')
print('✅ assets/icon.png created')
