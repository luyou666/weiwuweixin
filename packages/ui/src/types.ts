import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/* ============================================================
   围物为心 — 组件 Props 类型定义
   ============================================================ */

/** 通用尺寸 */
export type Size = 'sm' | 'md' | 'lg';

/** 通用情感色彩 */
export type Sentiment = 'primary' | 'secondary' | 'muted';

/** 空态插画变体 */
export type EmptyStateVariant = 'whale' | 'mountain' | 'boat' | 'tea';

/** 空态场景变体（语义化快捷映射） */
export type EmptyStateScene =
  | 'list-empty'     /** 空榜单 → whale */
  | 'comment-empty'  /** 空评论 → mountain */
  | 'search-empty'   /** 空搜索结果 → boat */
  | 'user-empty';    /** 空用户 → tea */

/** PageState 状态枚举 */
export type PageStateType = 'loading' | 'error' | 'empty' | 'content';

/** 骨架屏变体 */
export type SkeletonVariant = 'text' | 'card' | 'avatar' | 'custom';

/* ------------------------------------------------------------
   Button
   ------------------------------------------------------------ */
export interface ButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  /** 按钮尺寸 */
  size?: Size;
  /** 是否占满父容器宽度 */
  fullWidth?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 左侧图标 */
  iconLeft?: ReactNode;
  /** 右侧图标 */
  iconRight?: ReactNode;
  /** HTML 按钮类型 */
  htmlType?: 'button' | 'submit' | 'reset';
}

/* ------------------------------------------------------------
   Card
   ------------------------------------------------------------ */
export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  /** 卡片尺寸 */
  size?: Size;
  /** 是否可悬浮交互 */
  interactive?: boolean;
  /** 是否显示纸面纹理 */
  textured?: boolean;
  /** 倾斜角度（hover 时叠加） */
  tiltAngle?: number;
}

/* ------------------------------------------------------------
   Sticker
   ------------------------------------------------------------ */
export interface StickerProps
  extends HTMLAttributes<HTMLDivElement> {
  /** 尺寸 */
  size?: Size;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可旋转 */
  rotatable?: boolean;
  /** 初始随机旋转角度 */
  initialRotation?: number;
  /** 是否显示折角 */
  folded?: boolean;
}

/* ------------------------------------------------------------
   Slider
   ------------------------------------------------------------ */
export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** 当前值 */
  value: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 尺寸 */
  size?: Size;
  /** 值变化回调 */
  onChange: (value: number) => void;
  /** 是否显示数值标签 */
  showLabel?: boolean;
  /** 是否启用墨滴动画 */
  inkEffect?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 主题色（默认使用朱砂） */
  accentColor?: string;
}

/* ------------------------------------------------------------
   ConfidenceSeal
   ------------------------------------------------------------ */
export interface ConfidenceSealProps
  extends HTMLAttributes<HTMLDivElement> {
  /** 置信度 0-1 */
  confidence: number;
  /** 尺寸 */
  size?: Size;
  /** 印章文字 */
  label?: string;
  /** 外圈是否旋转 */
  spinning?: boolean;
  /** 旋转速度（秒/圈） */
  spinDuration?: number;
  /** 低置信度提示文案 */
  lowText?: string;
  /** 高置信度提示文案 */
  highText?: string;
}

/* ------------------------------------------------------------
   EmptyState
   ------------------------------------------------------------ */
export interface EmptyStateProps
  extends HTMLAttributes<HTMLDivElement> {
  /** 插画变体 */
  variant?: EmptyStateVariant;
  /** 场景变体（语义化快捷，会覆盖 variant） */
  scene?: EmptyStateScene;
  /** 标题文案 */
  title?: string;
  /** 描述文案 */
  description?: string;
  /** 操作按钮 */
  action?: ReactNode;
  /** 尺寸 */
  size?: Size;
}

/* ------------------------------------------------------------
   SkeletonInk
   ------------------------------------------------------------ */
export interface SkeletonInkProps
  extends HTMLAttributes<HTMLDivElement> {
  /** 骨架变体 */
  variant?: SkeletonVariant;
  /** 行数（text 变体使用） */
  lines?: number;
  /** 尺寸 */
  size?: Size;
  /** 是否启用水墨晕染动画 */
  animated?: boolean;
  /** 圆角 */
  radius?: string;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
}

/* ------------------------------------------------------------
   LoadingState
   ------------------------------------------------------------ */
export interface LoadingStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  /** 加载文案 */
  message?: string;
  /** 多久后显示骨架屏（ms），默认 3000 */
  showSkeletonAfter?: number;
  /** 骨架屏列数 */
  skeletonColumns?: number;
  /** 骨架屏行数 */
  skeletonRows?: number;
}

/* ------------------------------------------------------------
   ErrorState
   ------------------------------------------------------------ */
export interface ErrorStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  /** 错误标题 */
  title?: string;
  /** 错误描述 */
  description?: string;
  /** 重试回调 */
  onRetry?: () => void;
  /** 重试按钮文案 */
  retryLabel?: string;
}

/* ------------------------------------------------------------
   PageState — 三态容器
   ------------------------------------------------------------ */
export interface PageStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  /** 当前页面状态 */
  pageState?: PageStateType;
  /** LoadingState 参数 */
  loadingMessage?: string;
  showSkeletonAfter?: number;
  skeletonColumns?: number;
  skeletonRows?: number;
  /** ErrorState 参数 */
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** 空态节点 */
  emptyNode?: ReactNode;
  /** 内容态子节点 */
  children?: ReactNode;
}