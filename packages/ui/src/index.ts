/* ============================================================
   围物为心 — UI 组件库统一导出
   ============================================================ */

// Design Tokens CSS（需在入口处引入）
import './tokens.css';

// 类型导出
export type {
  Size,
  Sentiment,
  EmptyStateVariant,
  EmptyStateScene,
  PageStateType,
  SkeletonVariant,
  ButtonProps,
  CardProps,
  StickerProps,
  SliderProps,
  ConfidenceSealProps,
  EmptyStateProps,
  SkeletonInkProps,
  LoadingStateProps,
  ErrorStateProps,
  PageStateProps,
} from './types';

// 组件导出
export { Button } from './components/Button';
export { Card } from './components/Card';
export { Sticker } from './components/Sticker';
export { Slider } from './components/Slider';
export { ConfidenceSeal } from './components/ConfidenceSeal';
export { EmptyState } from './components/EmptyState';
export { SkeletonInk } from './components/SkeletonInk';
export { LoadingState, ErrorState, PageState } from './components/PageState';
export { ShareCard, getTemplateList } from './components/ShareCard';
export type {
  CardTemplateId,
  CardOrientation,
  ShareCardData,
  ShareCardEntry,
  ShareCardProps,
} from './components/ShareCard';

// 类型再导出（命名空间便利）
export * from './types';