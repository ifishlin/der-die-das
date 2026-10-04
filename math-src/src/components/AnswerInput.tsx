import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  resetKey: string;
};

/** Big number box plus an on-screen 0–9 keypad. Enter submits. */
export function AnswerInput({ value, onChange, onSubmit, disabled, resetKey }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Focus without popping the iPad keyboard over the picture: only on devices with a fine pointer.
    try {
      if (window.matchMedia('(pointer: fine)').matches) ref.current?.focus();
    } catch {
      /* ignore */
    }
  }, [resetKey]);

  const push = (d: string) => {
    if (disabled) return;
    onChange((value + d).replace(/^0+(?=\d)/, '').slice(0, 4));
  };

  return (
    <form
      className="answer"
      onSubmit={e => {
        e.preventDefault();
        if (!disabled) onSubmit();
      }}
    >
      <label htmlFor={`answer-${resetKey}`} className="visually-hidden">
        答案
      </label>
      <div className="answer-row">
        <input
          id={`answer-${resetKey}`}
          ref={ref}
          className="answer-box"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          disabled={disabled}
          placeholder="?"
          onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
        <button type="submit" className="btn primary big" disabled={disabled || value === ''}>
          確認答案
        </button>
      </div>
      <div className="keypad" role="group" aria-label="數字鍵盤">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button key={d} type="button" className="key" onClick={() => push(d)} disabled={disabled} aria-label={`數字 ${d}`}>
            {d}
          </button>
        ))}
        <button type="button" className="key soft" onClick={() => !disabled && onChange('')} disabled={disabled} aria-label="清除">
          清除
        </button>
        <button type="button" className="key" onClick={() => push('0')} disabled={disabled} aria-label="數字 0">
          0
        </button>
        <button type="button" className="key soft" onClick={() => !disabled && onChange(value.slice(0, -1))} disabled={disabled} aria-label="刪掉一個數字">
          ⌫
        </button>
      </div>
    </form>
  );
}
