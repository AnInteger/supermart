/**
 * ProfileForm 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';

// Mock updateProfile action
vi.mock('@/app/actions/user', () => ({
  updateProfile: vi.fn().mockResolvedValue({ success: true, data: { id: '1', name: 'Updated', bio: 'New bio', avatar: null } }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProfileForm', () => {
  const defaultValues = {
    name: 'Test User',
    bio: 'Test bio',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI 渲染', () => {
    it('应该渲染昵称和简介输入框', () => {
      render(<ProfileForm defaultValues={defaultValues} />);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument();
    });

    it('应该显示默认值', () => {
      render(<ProfileForm defaultValues={{ name: 'Default Name', bio: null }} />);

      expect(screen.getByDisplayValue('Default Name')).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('应该阻止过短昵称提交', async () => {
      const { updateProfile } = await import('@/app/actions/user');
      const user = userEvent.setup();
      render(<ProfileForm defaultValues={defaultValues} />);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'A'); // 只有一个字符

      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateProfile).not.toHaveBeenCalled();
      });
    });

    it('应该阻止过长昵称提交', async () => {
      const { updateProfile } = await import('@/app/actions/user');
      const user = userEvent.setup();
      render(<ProfileForm defaultValues={defaultValues} />);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(25)); // 超过20个字符

      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateProfile).not.toHaveBeenCalled();
      });
    });
  });

  describe('提交行为', () => {
    it('应该成功提交表单', async () => {
      const { updateProfile } = await import('@/app/actions/user');
      const user = userEvent.setup();
      render(<ProfileForm defaultValues={defaultValues} />);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /保存/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith({
          name: 'Updated Name',
          bio: 'Test bio',
        });
      });
    });
  });
});
