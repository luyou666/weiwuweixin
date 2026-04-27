import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Sticker } from '../components/Sticker';
import { ConfidenceSeal } from '../components/ConfidenceSeal';
import { EmptyState } from '../components/EmptyState';
import { SkeletonInk } from '../components/SkeletonInk';

describe('Button', () => {
  it('renders children text', () => {
    render(React.createElement(Button, null, '测试按钮'));
    expect(screen.getByText('测试按钮')).toBeInTheDocument();
  });

  it('applies weiwu-btn class', () => {
    const { container } = render(React.createElement(Button, null, '按钮'));
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain('weiwu-btn');
  });

  it('is disabled when disabled prop is true', () => {
    render(React.createElement(Button, { disabled: true }, '禁用'));
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(React.createElement(Card, null, '卡片内容'));
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });

  it('has weiwu-card class', () => {
    const { container } = render(React.createElement(Card, null, '卡片'));
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('weiwu-card');
  });
});

describe('Sticker', () => {
  it('renders children', () => {
    render(React.createElement(Sticker, null, '贴纸'));
    expect(screen.getByText('贴纸')).toBeInTheDocument();
  });
});

describe('ConfidenceSeal', () => {
  it('renders percentage value', () => {
    render(React.createElement(ConfidenceSeal, { confidence: 0.75 }));
    // Percentage number is in a separate element from the % sign
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('shows high confidence label by default', () => {
    render(React.createElement(ConfidenceSeal, { confidence: 0.8 }));
    expect(screen.getByText('确然')).toBeInTheDocument();
  });

  it('shows low confidence label', () => {
    render(React.createElement(ConfidenceSeal, { confidence: 0.2 }));
    expect(screen.getByText('存疑')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders default title for whale variant', () => {
    render(React.createElement(EmptyState, { variant: 'whale' }));
    expect(screen.getByText('海阔凭鱼跃')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(React.createElement(EmptyState, { variant: 'mountain', title: '自定义标题' }));
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      React.createElement(EmptyState, {
        variant: 'boat',
        action: React.createElement('button', null, '操作'),
      }),
    );
    expect(screen.getByText('操作')).toBeInTheDocument();
  });
});

describe('SkeletonInk', () => {
  it('renders skeleton element', () => {
    const { container } = render(React.createElement(SkeletonInk, { variant: 'text' }));
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders multiple lines', () => {
    const { container } = render(React.createElement(SkeletonInk, { variant: 'text', lines: 3 }));
    const lines = container.querySelectorAll('.weiwu-skeleton-ink-line');
    expect(lines.length).toBe(3);
  });
});