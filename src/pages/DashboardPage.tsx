import { ArrowRight, BookOpen, Flame, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProgressRing } from '../components/ProgressRing';
import { StatCard } from '../components/StatCard';
import { StreakCalendar } from '../components/StreakCalendar';
import { WeakAreasChart } from '../components/WeakAreasChart';
import { getChicagoDateKey } from '../engine/dateChicago';
import { accuracyBySkill, summarizeWeakAreas } from '../engine/review';
import { buildStreakState } from '../engine/streaks';
import { getAttempts, getCompletions, getDailySet, getLoginDates, getSettings } from '../storage/db';
import { useEffect, useState } from 'react';
import type { AttemptRecord, DailyCompletionRecord, DailySetRecord, UserSettings } from '../storage/schema';

export function DashboardPage(): JSX.Element {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [completions, setCompletions] = useState<DailyCompletionRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ id: 'settings' });
  const [todaySet, setTodaySet] = useState<DailySetRecord | undefined>();
  const [loginDates, setLoginDates] = useState<string[]>([]);
  const todayKey = getChicagoDateKey();

  useEffect(() => {
    async function load(): Promise<void> {
      const [loadedAttempts, loadedCompletions, loadedSettings, loadedTodaySet, loadedLoginDates] = await Promise.all([
        getAttempts(),
        getCompletions(),
        getSettings(),
        getDailySet(todayKey),
        getLoginDates(),
      ]);
      setAttempts(loadedAttempts);
      setCompletions(loadedCompletions);
      setSettings(loadedSettings);
      setTodaySet(loadedTodaySet);
      setLoginDates(loadedLoginDates);
    }
    void load();
  }, [todayKey]);

  const streak = buildStreakState(completions, attempts, loginDates, todayKey);
  const weakAreas = summarizeWeakAreas(attempts);
  const accuracy = accuracyBySkill(attempts);
  const objectiveAttempts = attempts.filter((attempt) => attempt.correct !== undefined);
  const objectiveAccuracy =
    objectiveAttempts.length === 0 ? 0 : objectiveAttempts.filter((attempt) => attempt.correct).length / objectiveAttempts.length;
  const completeToday = completions.some((completion) => completion.dateKey === todayKey);
  const rubricAttempts = attempts.filter((attempt) => attempt.rubricScores);
  const rubricTrend =
    rubricAttempts.length === 0
      ? 'No self-scores yet'
      : `${rubricAttempts.length} writing/oral self-assessments saved`;

  return (
    <div className="dashboard-page">
      <section className="hero-band">
        <div>
          <p className="eyebrow">America/Chicago daily practice</p>
          <h1>Spanish MTEL Coach</h1>
          <p>
            Original MTEL-style Spanish practice with local progress, adaptive weak-area review, and no server-side learner storage.
          </p>
        </div>
        <Link className="primary-button hero-cta" to="/daily">
          <span>{completeToday ? 'Review today' : "Start today's 10"}</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="stat-grid">
        <StatCard label="Current streak" value={streak.currentStreak} detail="Daily sets completed in a row" icon={<Flame size={18} />} />
        <StatCard label="Longest streak" value={streak.longestStreak} detail="Best run preserved after missed days" />
        <StatCard label="Today" value={completeToday ? 'Complete' : `${todaySet?.submittedQuestionIds.length ?? 0}/10`} detail={todayKey} />
        <StatCard label="Questions answered" value={attempts.length} detail="Daily and extra practice combined" icon={<BookOpen size={18} />} />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Overall objective accuracy</h2>
            <Target size={20} />
          </div>
          <ProgressRing value={objectiveAccuracy} label="Objective accuracy" />
          <div className="accuracy-list">
            {accuracy.length === 0 ? (
              <p className="muted">Objective accuracy appears after multiple-choice practice.</p>
            ) : (
              accuracy.map((row) => (
                <p key={row.skillArea}>
                  <strong>{Math.round(row.accuracy * 100)}%</strong> {row.skillArea.replace('_', ' ')} ({row.correct}/{row.total})
                </p>
              ))
            )}
          </div>
        </div>
        <div className="panel">
          <h2>Recent weak areas</h2>
          {attempts.length === 0 ? <p className="muted">New learner mix is ready. Weak-area adaptation starts after attempts are saved.</p> : <WeakAreasChart areas={weakAreas} />}
          <Link className="secondary-button" to="/practice">
            Extra practice
          </Link>
        </div>
        <div className="panel">
          <h2>Last 7 days</h2>
          <StreakCalendar days={streak.last7Days} />
        </div>
        <div className="panel">
          <h2>Writing and oral trend</h2>
          <p>{rubricTrend}</p>
          {!settings.lastExportAt ? (
            <p className="backup-reminder">No backup export has been recorded yet. Export progress from Settings before changing browsers or devices.</p>
          ) : (
            <p className="muted">Last export: {new Date(settings.lastExportAt).toLocaleDateString()}</p>
          )}
        </div>
      </section>
    </div>
  );
}
