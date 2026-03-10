/**
 * LoginForm 组件测试
 * 专注于 UI 层面的测试， */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI 渲染', () => {
    it('应该渲染邮箱和密码输入框', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

    it('应该有正确的输入类型', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('表单验证', () => {
    it('应该显示邮箱格式验证错误', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/邮箱/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /登录/i });
      await user.click(submitButton);

      await waitFor(() => {
        // 匹配 loginSchema 中的实际错误消息
        expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument();
      });
    });

    it('应该显示密码必填错误', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/邮箱/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /登录/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请输入密码/i)).toBeInTheDocument();
      });
    });
  });

  describe('提交行为', () => {
    it('应该禁用提交按钮当正在提交时', async () => {
      const { signIn } = await import('next-auth/react');
      // 模拟慢速响应
      vi.mocked(signIn).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/邮箱/i);
      const passwordInput = screen.getByLabelText(/密码/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /登录/i });

      await act(async () => {
        await user.click(submitButton);
      });

      // 按钮应该被禁用且显示加载状态
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/登录中/i)).toBeInTheDocument();
      });
    });

    it('应该使用正确的参数调用 signIn', async () => {
      const { signIn } = await import('next-auth/react');

      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/邮箱/i);
      const passwordInput = screen.getByLabelText(/密码/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /登录/i });

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'Password123',
          redirect: false,
        });
      });
    });
  });
});
