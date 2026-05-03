/**
 * 围物为心 — 敏感词过滤服务
 *
 * 基于 DFA (Deterministic Finite Automaton) 的高性能敏感词检测，
 * 使用 konsheng/Sensitive-lexicon 开源词库。
 * 
 * 设计原则：
 * - 纯本地运行，零延迟、零网络依赖
 * - 仅做命中检测，不依赖云服务
 * - 提供 validateSensitive() 用于请求级校验
 */

// ═══════════════════════════════════════════════════
// 基础敏感词列表（公开领域常见敏感词，来源：Sensitive-lexicon）
// 正式上线前可替换为完整词库文件加载
// ═══════════════════════════════════════════════════
const SENSITIVE_WORDS = new Set([
  // 色情相关
  'AV', 'SM', '三级片', '乱伦', '人兽', '偷拍', '做爱', '兽交',
  '口交', '同性恋色情', '妓女', '嫖娼', '援交', '性交', '性奴',
  '性虐待', '性爱', '情色', '成人电影', '成人视频', '招妓',
  '插穴', '换妻', '裸体', '裸聊', '轮奸', '迷奸', '阴唇',
  '阴户', '阴茎', '阴道', '龟头',
  // 赌博类
  '赌场', '赌球', '赌马', '博彩', '六合彩', '彩票预测',
  '外围投注', '老虎机', '澳门赌场', '网上赌场',
  // 毒品类
  '冰毒', '海洛因', '可卡因', '摇头丸', 'K粉', '大麻',
  '毒品', '吸毒', '贩毒', '制毒',
  // 政治敏感（基础）
  '法轮功', 'FLG', '藏独', '疆独', '台独', '六四',
  '天安门事件', '达赖', '热比娅',
  // 人身攻击/辱骂
  '傻逼', 'SB', '草泥马', 'CNM', 'TMD', '他妈的', '你妈的',
  '操你妈', '去你妈的', '滚你妈的', '贱人', '废物', '白痴',
  '脑残', '智障', '狗日的', '婊子',
  // 暴力恐怖
  '恐怖袭击', '恐怖分子', '基地组织', '圣战', '斩首',
]);

// DFA 节点类型
interface DFANode {
  isEnd: boolean;
  children: Map<string, DFANode>;
}

// 构建 DFA 状态树
function buildDFA(words: Set<string>): DFANode {
  const root: DFANode = { isEnd: false, children: new Map() };
  
  for (const word of words) {
    let node = root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, { isEnd: false, children: new Map() });
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }
  
  return root;
}

// 懒初始化 DFA
let _dfa: DFANode | null = null;
function getDFA(): DFANode {
  if (!_dfa) {
    _dfa = buildDFA(SENSITIVE_WORDS);
  }
  return _dfa;
}

/**
 * 检测文本是否包含敏感词
 * @param text 待检测文本
 * @returns 命中的敏感词列表（空数组 = 通过检测）
 */
export function checkSensitive(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  
  const dfa = getDFA();
  const hits: string[] = [];
  const lower = text.toLowerCase();
  
  let i = 0;
  while (i < lower.length) {
    let node = dfa;
    let j = i;
    let lastMatchEnd = -1;
    
    while (j < lower.length && node.children.has(lower[j])) {
      node = node.children.get(lower[j])!;
      j++;
      if (node.isEnd) {
        lastMatchEnd = j;
      }
    }
    
    if (lastMatchEnd > i) {
      hits.push(text.slice(i, lastMatchEnd));
      i = lastMatchEnd;
    } else {
      i++;
    }
  }
  
  return hits;
}

/**
 * 敏感词验证结果
 */
export interface SensitiveResult {
  /** 是否通过验证 */
  valid: boolean;
  /** 命中的敏感词（仅开发环境返回，生产环境应隐藏） */
  hits?: string[];
  /** 错误消息 */
  message: string;
}

/**
 * 敏感词字段检测配置
 */
interface FieldConfig {
  field: string;
  label: string;
  maxLength: number;
}

/**
 * 验证多个字段是否包含敏感词
 * 用于路由层面的一次性校验
 * 
 * @param fields 要检测的字段映射 { fieldName: fieldValue }
 * @returns 检测结果，valid=false 时可直接返回给客户端
 */
export function validateSensitive(
  fields: Record<string, string>
): SensitiveResult {
  const allHits: string[] = [];
  
  // 跳过纯空白和极短内容（"你好"、"hi" 等）
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value || value.trim().length <= 1) continue;
    
    const hits = checkSensitive(value);
    if (hits.length > 0) {
      allHits.push(...hits);
    }
  }
  
  if (allHits.length > 0) {
    // 去重
    const uniqueHits = [...new Set(allHits)];
    return {
      valid: false,
      hits: process.env.NODE_ENV === 'development' ? uniqueHits : undefined,
      message: '内容包含违规信息，请修改后重新提交',
    };
  }
  
  return {
    valid: true,
    message: '',
  };
}

/**
 * 快速检测单个字符串（用于中间件）
 */
export function hasSensitiveContent(text: string): boolean {
  return checkSensitive(text).length > 0;
}
