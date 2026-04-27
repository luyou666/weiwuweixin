// Types
export type { Item, Dimension, DimensionScore, ScoredItem, ExplanationNode, ScoringEngine } from './types';
export { normalizeWeights } from './types';

// Engines
export { weightedMeanEngine } from './engines/weighted-mean';
export { geometricMeanEngine } from './engines/geometric-mean';
export { bordaCountEngine } from './engines/borda-count';
export { topsisEngine } from './engines/topsis';
export { bayesianShrinkageEngine, createBayesianShrinkageEngine } from './engines/bayesian-shrinkage';
export type { BayesianShrinkageOptions } from './engines/bayesian-shrinkage';

// Confidence (not a scoring engine, pure functions only)
export { kendallTau, timeDecay, computeConfidence, explainConfidence } from './engines/confidence';
export type { ConfidenceParams } from './engines/confidence';

// Anti-cheat
export { detectSuspiciousScore, computeWeight } from './anti-cheat';
export type { AntiCheatInput, AntiCheatResult, AntiCheatFlag } from './anti-cheat';

// Registry
export { registry, getAllEngines, getEngine } from './registry';