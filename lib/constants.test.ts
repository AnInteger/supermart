import { describe, it, expect } from 'vitest';
import {
  CONTENT_TYPES,
  CONTENT_STATUS,
  USER_ROLES,
  DEFAULT_CATEGORIES,
  SORT_OPTIONS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} from './constants';

describe('CONTENT_TYPES', () => {
  it('has SKILL type', () => {
    expect(CONTENT_TYPES.SKILL).toBe('SKILL');
  });

  it('has AGENT type', () => {
    expect(CONTENT_TYPES.AGENT).toBe('AGENT');
  });
});

describe('CONTENT_STATUS', () => {
  it('has DRAFT status', () => {
    expect(CONTENT_STATUS.DRAFT).toBe('DRAFT');
  });

  it('has PUBLISHED status', () => {
    expect(CONTENT_STATUS.PUBLISHED).toBe('PUBLISHED');
  });

  it('has ARCHIVED status', () => {
    expect(CONTENT_STATUS.ARCHIVED).toBe('ARCHIVED');
  });
});

describe('USER_ROLES', () => {
  it('has USER role', () => {
    expect(USER_ROLES.USER).toBe('USER');
  });

  it('has ADMIN role', () => {
    expect(USER_ROLES.ADMIN).toBe('ADMIN');
  });
});

describe('DEFAULT_CATEGORIES', () => {
  it('has 5 categories', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(5);
  });

  it('has required fields', () => {
    DEFAULT_CATEGORIES.forEach(cat => {
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('slug');
      expect(cat).toHaveProperty('icon');
    });
  });

  it('first category is software development', () => {
    expect(DEFAULT_CATEGORIES[0].name).toBe('软件开发');
    expect(DEFAULT_CATEGORIES[0].slug).toBe('software-dev');
  });
});

describe('SORT_OPTIONS', () => {
  it('has 3 sort options', () => {
    expect(SORT_OPTIONS).toHaveLength(3);
  });

  it('has latest option', () => {
    expect(SORT_OPTIONS[0].value).toBe('latest');
  });
});

describe('Pagination constants', () => {
  it('DEFAULT_PAGE_SIZE is 12', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(12);
  });

  it('MAX_PAGE_SIZE is 50', () => {
    expect(MAX_PAGE_SIZE).toBe(50);
  });
});
