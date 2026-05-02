'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGORITHM_METAS } from '@/lib/api';

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

          {/* 面板 — 上扬模态框，第一眼区域 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0A0A14] rounded-2xl shadow-2xl border border-white/10"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
            <div className="px-lg pt-lg pb-xl">

              {/* 标题 */}
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h3 className="font-heading text-xl text-white">
                    算法选择参考
                  </h3>
                  <p className="text-sm text-white/60 mt-xs">
                    根据你的场景，选择最合适的聚合方式
                  </p>
                </div>
                <button type="button"
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors text-xl leading-none p-xs"
                >
                  ✕
                </button>
              </div>

              {/* 重要提示 */}
              <div className="mb-lg px-md py-sm rounded-md bg-white/5 border border-white/10">
                <p className="text-sm text-white/70 leading-relaxed">
                  💡 雷达图展示的是各算法的<span className="font-medium text-white">特征倾向</span>，而非优劣。没有「最好」的算法，只有最适合你的。
                </p>
              </div>

              {/* 场景选择（优先展示，确保首屏可见） */}
              <div className="mb-lg">
                <h4 className="font-heading text-sm text-white/70 mb-sm">
                  你的场景是什么？
                </h4>
                <div className="grid grid-cols-2 gap-sm">
                  {SCENES.map((scene) => (
                    <button type="button"
                      key={scene.id}
                      onClick={() => setSelectedScene(scene.id === selectedScene ? null : scene.id)}
                      className={`
                        text-left px-md py-sm rounded-md border transition-all
                        ${selectedScene === scene.id
                          ? 'border-vermilion bg-vermilion/10 shadow-sm shadow-vermilion/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-lg mr-xs">{scene.emoji}</span>
                      <span className="text-sm font-medium text-white">
                        {scene.label}
                      </span>
                      {scene.id === 'unsure' && (
                        <span className="ml-xs text-xs text-white/30">
                          推荐
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 算法对比简表（紧凑横向卡片） */}
              <div className="mb-lg">
                <h4 className="font-heading text-sm text-white/70 mb-sm">
                  算法一览
                </h4>
                <div className="grid grid-cols-5 gap-xs">
                  {ALGORITHM_METAS.map((algo) => (
                    <div
                      key={algo.id}
                      className="flex flex-col px-xs py-sm rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-default"
                    >
                      <span className="font-heading text-xs text-white mb-xs leading-tight">
                        {algo.name}
                      </span>
                      <p className="text-[0.65rem] text-white/50 mb-xs leading-relaxed flex-1">
                        {algo.description}
                      </p>
                      <div className="mt-auto space-y-3xs">
                        <span className="block text-[0.65rem] px-xs py-3xs rounded bg-celadon/15 text-celadon-light">
                          ✓ {(algo.recommendation ?? '').slice(0, 12)}
                        </span>
                        <span className="block text-[0.65rem] px-xs py-3xs rounded bg-apricot/15 text-apricot-light">
                          ✗ {(algo.cons ?? [])[0] ?? '—'}
                        </span>
                      </div>
                    </div>
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
                    className="px-md py-md rounded-md border-2 border-vermilion bg-vermilion/10"
                  >
                    <div className="flex items-center gap-sm mb-xs">
                      <span className="text-vermilion text-lg">✦</span>
                      <span className="font-heading text-lg text-white">
                        推荐：{recommendedAlgo.name}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-sm">
                      {selectedSceneData.reason}
                    </p>
                    <p className="text-xs text-white/40 italic">
                      这只是参考建议——你比算法更了解你的榜单。
                    </p>
                    <div className="mt-sm flex gap-sm">
                      <button type="button"
                        onClick={() => {
                          onSelectAlgo?.(selectedSceneData.recommendedAlgoId);
                          onClose?.();
                        }}
                        className="px-md py-xs rounded-md bg-vermilion text-white text-sm font-medium hover:bg-vermilion-dark transition-colors"
                      >
                        采用此算法
                      </button>
                      <button type="button"
                        onClick={onClose}
                        className="px-md py-xs rounded-md border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
                      >
                        我再想想
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}