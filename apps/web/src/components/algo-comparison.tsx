'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGORITHM_METAS } from '@/lib/mock-data';

/* ============================================================
   算法对比推荐面板
   - 展示5种算法的关键差异
   - 选择场景后推荐算法
   - 「我不确定」→ 推荐加权平均
   ============================================================ */

interface SceneOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  recommendedAlgoId: string;
  reason: string;
}

const SCENES: SceneOption[] = [
  {
    id: 'independent',
    label: '维度独立、各有所长',
    emoji: '🎯',
    description: '每个维度独立打分，不存在短板惩罚需求',
    recommendedAlgoId: 'weighted-mean',
    reason: '各维度互不牵制时，加权平均最直观且灵活。',
  },
  {
    id: 'balance',
    label: '需要均衡、不容短板',
    emoji: '⚖️',
    description: '希望任何一环太差都会拉低总分',
    recommendedAlgoId: 'geometric-mean',
    reason: '几何平均天然惩罚短板，强迫均衡。',
  },
  {
    id: 'ranking',
    label: '只关注排名、不看绝对分',
    emoji: '🏆',
    description: '相对顺序比绝对数值更重要',
    recommendedAlgoId: 'borda-count',
    reason: 'Borda 排位分只看排名，不受评分尺度影响。',
  },
  {
    id: 'multi-criteria',
    label: '多准则综合决策',
    emoji: '🗺️',
    description: '多个维度需要从全局最优角度综合比较',
    recommendedAlgoId: 'topsis',
    reason: 'TOPSIS 计算与理想解的距离，适合全局比较。',
  },
  {
    id: 'few-voters',
    label: '评分人数不一、需要公平',
    emoji: '📊',
    description: '有些条目评价很多，有些很少，需公平对比',
    recommendedAlgoId: 'bayesian-shrinkage',
    reason: '贝叶斯收缩自动向均值回归，抵抗小样本波动。',
  },
  {
    id: 'unsure',
    label: '我不确定',
    emoji: '🤔',
    description: '不太了解这些算法，帮我选一个吧',
    recommendedAlgoId: 'weighted-mean',
    reason: '加权平均是最通用、最直观的起点。你随时可以更改。',
  },
];

interface AlgoComparisonProps {
  open?: boolean;
  onClose?: () => void;
  onSelectAlgo?: (id: string) => void;
}

export function AlgoComparison({
  open = false,
  onClose,
  onSelectAlgo,
}: AlgoComparisonProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const selectedSceneData = SCENES.find((s) => s.id === selectedScene);
  const recommendedAlgo = selectedSceneData
    ? ALGORITHM_METAS.find((a) => a.id === selectedSceneData.recommendedAlgoId)
    : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 面板 */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto bg-paper rounded-t-2xl shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="max-w-3xl mx-auto px-lg pt-lg pb-xl">
              {/* 拖拽指示条 */}
              <div className="flex justify-center mb-lg">
                <div className="w-10 h-1 rounded-full bg-ink-100" />
              </div>

              {/* 标题 */}
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h3 className="font-heading text-xl text-ink-900">
                    算法选择参考
                  </h3>
                  <p className="text-sm text-ink-500 mt-xs">
                    根据你的场景，选择最合适的聚合方式
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-ink-300 hover:text-ink-900 transition-colors text-xl leading-none p-xs"
                >
                  ✕
                </button>
              </div>

              {/* 重要提示 */}
              <div className="mb-lg px-md py-sm rounded-md bg-rice border border-ink-100">
                <p className="text-sm text-ink-700 leading-relaxed">
                  💡 雷达图展示的是各算法的<span className="font-medium text-ink-900">特征倾向</span>，而非优劣。没有「最好」的算法，只有最适合你的。
                </p>
              </div>

              {/* 算法对比简表 */}
              <div className="mb-lg">
                <h4 className="font-heading text-sm text-ink-700 mb-sm">
                  算法一览
                </h4>
                <div className="space-y-sm">
                  {ALGORITHM_METAS.map((algo) => (
                    <div
                      key={algo.id}
                      className="flex items-start gap-md px-md py-sm rounded-md border border-ink-100 bg-paper hover:bg-rice transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm mb-xs">
                          <span className="font-heading text-sm text-ink-900">
                            {algo.name}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 mb-xs">
                          {algo.description}
                        </p>
                        <div className="flex flex-wrap gap-xs">
                          <span className="text-xs px-xs py-3xs rounded bg-celadon/10 text-celadon-dark">
                            适合：{algo.recommendation.slice(0, 15)}…
                          </span>
                          <span className="text-xs px-xs py-3xs rounded bg-apricot/10 text-apricot-dark">
                            短板：{algo.cons[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 场景选择 */}
              <div className="mb-lg">
                <h4 className="font-heading text-sm text-ink-700 mb-sm">
                  你的场景是什么？
                </h4>
                <div className="grid grid-cols-2 gap-sm">
                  {SCENES.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setSelectedScene(scene.id === selectedScene ? null : scene.id)}
                      className={`
                        text-left px-md py-sm rounded-md border transition-all
                        ${selectedScene === scene.id
                          ? 'border-vermilion bg-vermilion/5 shadow-sm'
                          : 'border-ink-100 bg-paper hover:bg-rice'
                        }
                      `}
                    >
                      <span className="text-lg mr-xs">{scene.emoji}</span>
                      <span className="text-sm font-medium text-ink-900">
                        {scene.label}
                      </span>
                      {scene.id === 'unsure' && (
                        <span className="ml-xs text-xs text-ink-300">
                          推荐
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 推荐结果 */}
              <AnimatePresence mode="wait">
                {selectedSceneData && recommendedAlgo && (
                  <motion.div
                    key={selectedSceneData.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="px-md py-md rounded-md border-2 border-vermilion bg-vermilion/5"
                  >
                    <div className="flex items-center gap-sm mb-xs">
                      <span className="text-vermilion text-lg">✦</span>
                      <span className="font-heading text-lg text-ink-900">
                        推荐：{recommendedAlgo.name}
                      </span>
                    </div>
                    <p className="text-sm text-ink-700 mb-sm">
                      {selectedSceneData.reason}
                    </p>
                    <p className="text-xs text-ink-300 italic">
                      这只是参考建议——你比算法更了解你的榜单。
                    </p>
                    <div className="mt-sm flex gap-sm">
                      <button
                        onClick={() => {
                          onSelectAlgo?.(selectedSceneData.recommendedAlgoId);
                          onClose?.();
                        }}
                        className="px-md py-xs rounded-md bg-vermilion text-paper text-sm font-medium hover:bg-vermilion-dark transition-colors"
                      >
                        采用此算法
                      </button>
                      <button
                        onClick={onClose}
                        className="px-md py-xs rounded-md border border-ink-100 text-ink-500 text-sm hover:bg-rice transition-colors"
                      >
                        我再想想
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}