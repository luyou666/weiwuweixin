#!/usr/bin/env python3
import pathlib

f = pathlib.Path('/home/zhuwankai/weiwuweixin/apps/web/src/app/[locale]/page.tsx')
text = f.read_text()

idx = text.find('brightness(1.8) saturate(1.4)')
if idx > 0:
    chunk = text[idx-80:idx+200]
    print(repr(chunk[:300]))
else:
    print("NOT FOUND")