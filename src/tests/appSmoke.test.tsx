import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { DailyQuizPage } from '../pages/DailyQuizPage';
import { SettingsPage } from '../pages/SettingsPage';
import { clearAllData, resetDbConnectionForTests } from '../storage/db';
import * as exportImport from '../storage/exportImport';

describe('app smoke', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    resetDbConnectionForTests();
    await clearAllData();
    window.location.hash = '';
  });

  it('blocks the app behind the passcode gate and unlocks with the test passcode', async () => {
    const user = userEvent.setup();
    render(<App />);
    const passcodeInput = screen.getByLabelText('Passcode', { selector: 'input' });
    expect(passcodeInput).toBeInTheDocument();
    expect(screen.queryByText(/current streak/i)).not.toBeInTheDocument();
    await user.type(passcodeInput, 'test-passcode-for-ci-only');
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    expect(await screen.findByText(/current streak/i)).toBeInTheDocument();
  });

  it('keeps incorrect passcodes locked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Passcode', { selector: 'input' }), 'wrong');
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    expect(await screen.findByText(/did not unlock/i)).toBeInTheDocument();
  });

  it('renders an empty dashboard state after unlock', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Passcode', { selector: 'input' }), 'test-passcode-for-ci-only');
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    expect(await screen.findByText(/weak-area adaptation starts/i)).toBeInTheDocument();
  });

  it('daily quiz shows one question at a time and reveals explanations after submit', async () => {
    const user = userEvent.setup();
    render(<DailyQuizPage />);
    expect(await screen.findByText(/Question 1 of 10/i)).toBeInTheDocument();
    expect(screen.queryByText(/Correct|Review this answer/i)).not.toBeInTheDocument();
    const radios = await screen.findAllByRole('radio');
    await user.click(radios[0]);
    await user.click(screen.getByRole('button', { name: /submit answer/i }));
    expect(await screen.findByText(/Correct|Review this answer/i)).toBeInTheDocument();
  });

  it('daily quiz uses multiple choice for the full set', async () => {
    const user = userEvent.setup();
    render(<DailyQuizPage />);
    for (let step = 0; step < 10; step += 1) {
      expect(await screen.findByText(new RegExp(`Question ${step + 1} of 10`, 'i'))).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      const radios = await screen.findAllByRole('radio');
      expect(radios).toHaveLength(4);
      await user.click(radios[0]);
      await user.click(screen.getByRole('button', { name: /submit answer/i }));
      if (step < 9) await user.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(await screen.findByText(/All 10 questions are submitted/i)).toBeInTheDocument();
  });

  it('settings export button works with mocked download', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(exportImport, 'makeDownload').mockImplementation(() => undefined);
    render(<SettingsPage onLock={() => undefined} />);
    await user.click(screen.getByRole('button', { name: /export progress/i }));
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
