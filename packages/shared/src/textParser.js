/**
 * 批量导入文本解析器
 *
 * 支持格式：
 *   - 换行分隔条目名
 *   - 名称 | 备注
 *   - 名称 | 备注 | 链接
 *
 * 处理逻辑：去空行、trim、去重（按名称）
 */
export function parseBulkText(input) {
    if (!input || typeof input !== 'string')
        return [];
    const lines = input.split(/\r?\n/);
    const seen = new Set();
    const result = [];
    for (const raw of lines) {
        const line = raw.trim();
        if (line === '')
            continue;
        // 支持中文竖线或英文竖线
        const parts = line.split(/[|｜]/).map((s) => s.trim());
        const name = parts[0] ?? '';
        if (name === '')
            continue;
        // 去重
        if (seen.has(name))
            continue;
        seen.add(name);
        const note = parts.length >= 2 && parts[1] !== '' ? parts[1] : undefined;
        const url = parts.length >= 3 && parts[2] !== '' ? parts[2] : undefined;
        result.push({ name, note, url });
    }
    return result;
}
//# sourceMappingURL=textParser.js.map