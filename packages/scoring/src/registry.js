import { weightedMeanEngine } from './engines/weighted-mean';
import { geometricMeanEngine } from './engines/geometric-mean';
import { bordaCountEngine } from './engines/borda-count';
import { topsisEngine } from './engines/topsis';
import { bayesianShrinkageEngine } from './engines/bayesian-shrinkage';
/** 算法注册表：id → 引擎实例 */
export const registry = new Map([
    [weightedMeanEngine.id, weightedMeanEngine],
    [geometricMeanEngine.id, geometricMeanEngine],
    [bordaCountEngine.id, bordaCountEngine],
    [topsisEngine.id, topsisEngine],
    [bayesianShrinkageEngine.id, bayesianShrinkageEngine],
]);
/** 获取所有已注册的引擎列表 */
export function getAllEngines() {
    return Array.from(registry.values());
}
/** 根据ID获取引擎 */
export function getEngine(id) {
    return registry.get(id);
}
//# sourceMappingURL=registry.js.map