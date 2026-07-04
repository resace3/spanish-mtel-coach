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
    expect(screen.getByLabelText(/passcode/i)).toBeInTheDocument();
    expect(screen.queryByText(/current streak/i)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/passcode/i), 'test-passcode-for-ci-only');
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    expect(await screen.findByText(/current streak/i)).toBeInTheDocument();
  });

  it('keeps incorrect passcodes locked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/passcode/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    expect(await screen.findByText(/did not unlock/i)).toBeInTheDocument();
  });

  it('renders an empty dashboard state after unlock', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/passcode/i), 'test-passcode-for-ci-only');
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

  it('accent toolbar inserts characters for constructed responses', async () => {
    const user = userEvent.setup();
    render(<DailyQuizPage />);
    await screen.findByText(/Question 1 of 10/i);
    for (let step = 0; step < 8; step += 1) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length > 0) {
        await user.click(radios[0]);
      } else {
        await user.type(screen.getByLabelText(/response|transcript/i), 'Respuesta completa con detalles.');
      }
      await user.click(screen.getByRole('button', { name: /submit answer/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(await screen.findByLabelText(/written response/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Insert ñ' }));
    expect(screen.getByLabelText(/written response/i)).toHaveValue('ñ');
  });

  it('settings export button works with mocked download', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(exportImport, 'makeDownload').mockImplementation(() => undefined);
    render(<SettingsPage onLock={() => undefined} />);
    await user.click(screen.getByRole('button', { name: /export progress/i }));
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
