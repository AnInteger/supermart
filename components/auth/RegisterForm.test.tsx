/**
 * RegisterForm 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock auth server action
vi.mock('@/app/actions/auth', () => ({
  register: vi.fn().mockResolvedValue({ success: true, data: { id: '1', email: 'test@example.com', name: 'Test' } }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI 渲染', () => {
    it('应该渲染昵称、邮箱和密码输入框', () => {
      render(<RegisterForm />);

      expect(screen.getByPlaceholderText(/请输入昵称/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/请输入邮箱/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/至少8位/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('应该阻止无效邮箱提交', async () => {
      const { register } = await import('@/app/actions/auth');
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByPlaceholderText(/请输入昵称/i);
      const emailInput = screen.getByPlaceholderText(/请输入邮箱/i);
      const passwordInput = screen.getByPlaceholderText(/至少8位/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /注册/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(register).not.toHaveBeenCalled();
      });
    });

    it('应该阻止短密码提交', async () => {
      const { register } = await import('@/app/actions/auth');
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByPlaceholderText(/请输入昵称/i);
      const emailInput = screen.getByPlaceholderText(/请输入邮箱/i);
      const passwordInput = screen.getByPlaceholderText(/至少8位/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Pass');

      const submitButton = screen.getByRole('button', { name: /注册/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(register).not.toHaveBeenCalled();
      });
    });
  });

  describe('提交行为', () => {
    it('应该成功提交表单', async () => {
      const { register } = await import('@/app/actions/auth');
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByPlaceholderText(/请输入昵称/i);
      const emailInput = screen.getByPlaceholderText(/请输入邮箱/i);
      const passwordInput = screen.getByPlaceholderText(/至少8位/i);

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /注册/i });

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
        });
      });
    });
  });
});
