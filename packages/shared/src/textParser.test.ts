import { describe, it, expect } from 'vitest';
import { parseBulkText } from './textParser';
import type { ParsedItem } from './types';

describe('parseBulkText', () => {
  it('返回空数组 —— 空输入', () => {
    expect(parseBulkText('')).toEqual([]);
    expect(parseBulkText('   ')).toEqual([]);
    expect(parseBulkText('\n\n\n')).toEqual([]);
  });

  it('解析纯名称列表（换行分隔）', () => {
    const input = 'iPhone\nPixel\nGalaxy';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone' },
      { name: 'Pixel' },
      { name: 'Galaxy' },
    ]);
  });

  it('支持中英文竖线分隔的「名称 | 备注」', () => {
    const input = 'iPhone | 苹果手机\nPixel | 谷歌手机';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone', note: '苹果手机' },
      { name: 'Pixel', note: '谷歌手机' },
    ]);
  });

  it('支持中文竖线分隔', () => {
    const input = 'iPhone ｜ 苹果手机';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone', note: '苹果手机' },
    ]);
  });

  it('支持三段格式「名称 | 备注 | 链接」', () => {
    const input = 'iPhone | 苹果手机 | https://apple.com';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone', note: '苹果手机', url: 'https://apple.com' },
    ]);
  });

  it('去空行', () => {
    const input = 'iPhone\n\n\nPixel\n  \nGalaxy';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone' },
      { name: 'Pixel' },
      { name: 'Galaxy' },
    ]);
  });

  it('trim 空白', () => {
    const input = '  iPhone  \n  Pixel  ';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone' },
      { name: 'Pixel' },
    ]);
  });

  it('去重（按名称）', () => {
    const input = 'iPhone\niPhone\nPixel';
    const result = parseBulkText(input);
    expect(result).toEqual([
      { name: 'iPhone' },
      { name: 'Pixel' },
    ]);
  });

  it('备注为空时 note 为 undefined', () => {
    const input = 'iPhone | ';
    const result = parseBulkText(input);
    expect(result).toEqual([{ name: 'iPhone' }]);
  });

  it('链接为空时 url 为 undefined', () => {
    const input = 'iPhone | 备注 | ';
    const result = parseBulkText(input);
    expect(result).toEqual([{ name: 'iPhone', note: '备注' }]);
  });
});