import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../app/App';
import { loadSession } from '../app/storage';

const answer = (value: string) => {
  fireEvent.change(screen.getByLabelText('答案'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: '確認答案' }));
};

describe('app flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = () => {};
  });
  afterEach(cleanup);

  it('home → grade 1 → answer → progress kept → grade 2 custom multiplication', () => {
    render(<App />);
    const g1 = screen.getByText('小一數學：100 以內加減法').closest('article')!;
    fireEvent.click(within(g1).getByRole('button', { name: '開始 20 題' }));
    expect(screen.getByText('小一・第 1 / 20 題')).toBeTruthy();

    // 2 + 3: wrong first, then right
    answer('4');
    expect(screen.getByRole('status').textContent).toContain('再試一次');
    answer('5');
    expect(screen.getByRole('status').textContent).toContain('2 + 3 = 5');
    fireEvent.click(screen.getByRole('button', { name: '下一題 →' }));
    expect(screen.getByText('小一・第 2 / 20 題')).toBeTruthy();

    const saved = loadSession(1, 'preset');
    expect(saved?.index).toBe(1);
    expect(saved?.records['g1-01']).toMatchObject({ attempts: 2, correct: true, firstTry: false });

    // back home, then grade 2 custom question 3 × 4
    fireEvent.click(screen.getByRole('button', { name: '← 首頁' }));
    const g2 = screen.getByText('小二數學：100 以內加減法、基礎乘法').closest('article')!;
    fireEvent.click(within(g2).getByRole('button', { name: '自訂一道題' }));
    fireEvent.change(screen.getByLabelText('第一個數字'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('radio', { name: '乘' }));
    fireEvent.change(screen.getByLabelText('第二個數字'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: '產生圖解' }));
    expect(screen.getByText('3 × 4 就是 3 組，每組 4 個。')).toBeTruthy();

    // grade 1 progress is untouched by grade 2
    expect(loadSession(1, 'preset')?.index).toBe(1);
    expect(loadSession(2, 'preset')).toBeNull();
  });

  it('grade 1 custom question rejects answers over 100 with a reason', () => {
    render(<App />);
    const g1 = screen.getByText('小一數學：100 以內加減法').closest('article')!;
    fireEvent.click(within(g1).getByRole('button', { name: '自訂一道題' }));
    expect(screen.queryByRole('radio', { name: '乘' })).toBeNull();
    fireEvent.change(screen.getByLabelText('第一個數字'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('第二個數字'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: '產生圖解' }));
    expect(screen.getByRole('alert').textContent).toContain('小一的答案不能超過 100');
  });

  it('generates a new grade 2 set from the form', () => {
    render(<App />);
    const g2 = screen.getByText('小二數學：100 以內加減法、基礎乘法').closest('article')!;
    fireEvent.click(within(g2).getByRole('button', { name: '產生新題' }));
    fireEvent.click(screen.getByLabelText('5 題'));
    fireEvent.click(screen.getByRole('button', { name: '產生新練習' }));
    expect(screen.getByText('小二・第 1 / 5 題')).toBeTruthy();
    expect(loadSession(2, 'generated')?.questions).toHaveLength(5);
  });
});
