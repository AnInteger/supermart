import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatRelativeTime, truncate, slugify } from './utils';

describe('cn (className merge)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});

describe('formatDate', () => {
  it('formats date in Chinese locale', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date);
    expect(result).toContain('2024');
    expect(result).toContain('3月');
    expect(result).toContain('15');
  });

  it('accepts string date', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('2024');
  });
});

describe('formatRelativeTime', () => {
  it('returns just now for recent time', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('刚刚');
  });

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('5 分钟前');
  });

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('3 小时前');
  });

  it('returns days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('2 天前');
  });
});

describe('truncate', () => {
  it('returns original string if shorter than length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('removes special characters', () => {
    expect(slugify('hello!@#$%world')).toBe('hello-world');
  });

  it('preserves Chinese characters', () => {
    expect(slugify('你好 世界')).toBe('你好-世界');
  });
});
