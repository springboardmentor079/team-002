import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import api from "../../services/api";
import "../../styles/landing-command.css";

const POLL_INTERVAL_MS = 60000;

// Fixed palette for the dark operations screen (command-monitor look).
const SCREEN = {
  accent: "#ff7628",
  success: "#55d3a1",
  danger: "#f2715f",
  label: "#8494aa",
  text: "#eef2f8",
  faint: "#5d6d82",
};

// ================= HELPERS =================

const formatCrores = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-US");

const clampPct = (value) =>
  Math.min(Math.max(Number(value) || 0, 0), 100);

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("delay")) return "progress";
  if (value.includes("risk")) return "danger";
  if (value.includes("complete")) return "success";
  return "success";
};

// Smooth 0 → real value counter. Disabled for reduced motion.
function useAnimatedValue(target, duration = 1100) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const to = Number(target) || 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced || to === fromRef.current) {
      fromRef.current = to;
      setValue(to);
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    let raf;

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * eased;
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return value;
}

// ================= SHARED CHART UI =================

function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="cmd-tooltip">
      <strong>{label}</strong>
      {payload.map((entry, index) => (
        <span key={index}>
          <i style={{ background: entry.color || entry.fill }}></i>
          {entry.name}: {entry.value}
          {unit || ""}
        </span>
      ))}
    </div>
  );
}

// ================= SMALL PIECES =================

function MetricCard({ label, value, unit, sub, tone, bar }) {
  const showBar = bar !== undefined && bar !== null;

  return (
    <div className={`cmd-metric${tone === "green" ? " is-green" : ""}`}>
      <span className="cmd-metric-label">{label}</span>

      <div className="cmd-metric-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>

      <span className="cmd-metric-sub">{sub}</span>

      {showBar && (
        <div className="cmd-metric-bar">
          <span style={{ "--w": `${clampPct(bar)}%` }}></span>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ value }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = clampPct(value);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="92" height="92" viewBox="0 0 92 92" className="cmd-ring">
      <circle cx="46" cy="46" r={radius} className="cmd-ring-track" />
      <circle
        cx="46"
        cy="46"
        r={radius}
        className="cmd-ring-fill"
        stroke={SCREEN.accent}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="46" y="43" className="cmd-ring-value">
        {progress}%
      </text>
      <text x="46" y="56" className="cmd-ring-caption">
        overall
      </text>
    </svg>
  );
}

function TelemetryCard({ label, value, sub, ok, state }) {
  return (
    <div className="cmd-tel-card">
      <div className="cmd-tel-main">
        <div className="cmd-tel-text">
          <span className="cmd-tel-label">{label}</span>
          <div className={`cmd-tel-value${state ? " cmd-tel-state" : ""}`}>
            {value}
          </div>
        </div>

        <span className={`cmd-tel-ok${ok ? "" : " is-warn"}`}>
          {ok ? <Check size={13} /> : <AlertTriangle size={13} />}
        </span>
      </div>

      <span className="cmd-tel-sub">{sub}</span>
    </div>
  );
}

// ================= DARK COMMAND SCREEN =================

function CommandScreen({ pm, adm, animated }) {
  const budgetUtil = Number(pm?.budgetUtilization ?? 0);
  const spent = Number(pm?.budget?.spent ?? 0);
  const budgetTotal = Number(pm?.budget?.total ?? 0);
  const activeCrew = Number(pm?.activeCrew?.active ?? 0);
  const crewTotal = Number(pm?.activeCrew?.total ?? 0);
  const crewPct =
    crewTotal > 0 ? Math.round((activeCrew / crewTotal) * 100) : 0;

  const ringValue = Math.round(animated.progress);
  const budgetText = Math.round(animated.budget);
  const crewText = Math.round(animated.crew);

  const milestones = pm?.milestones || [];
  const series = pm?.projectProgressSeries || [];

  return (
    <div className="cmd-screen">
      <div className="cmd-screen-head">
        <span className="cmd-screen-kicker">Operations Command Screen</span>
        <span className="cmd-screen-sync">
          <RefreshCw size={10} />
          auto-sync
        </span>
      </div>

      <div className="cmd-screen-body">
        <div className="cmd-screen-left">
          <div className="cmd-ring-block">
            <span className="cmd-screen-label">Overall Progress</span>

            <div className="cmd-ring-wrap">
              <ProgressRing value={ringValue} />

              <div className="cmd-ring-tags">
                <span>
                  {adm?.totalProjects ?? "--"} projects tracked
                </span>
                <span>{adm?.completedProjects ?? "--"} completed</span>
              </div>
            </div>
          </div>

          <div className="cmd-screen-cell">
            <div className="cmd-screen-cell-head">
              <span className="cmd-screen-label">Budget Utilization</span>
              <strong>{budgetText}%</strong>
            </div>

            <div className="cmd-screen-bar">
              <span
                className="is-budget"
                style={{ "--w": `${clampPct(budgetUtil)}%` }}
              ></span>
            </div>

            <div className="cmd-screen-cell-note">
              <span>{formatCrores(spent)} spent</span>
              <span>of {formatCrores(budgetTotal)}</span>
            </div>
          </div>

          <div className="cmd-screen-cell">
            <div className="cmd-screen-cell-head">
              <span className="cmd-screen-label">Active Crew</span>
              <strong>
                {crewText} / {crewTotal}
              </strong>
            </div>

            <div className="cmd-screen-bar">
              <span
                className="is-crew"
                style={{ "--w": `${crewPct}%` }}
              ></span>
            </div>

            <div className="cmd-screen-cell-note">
              <span>{crewPct}% on site</span>
              <span>latest shift records</span>
            </div>
          </div>
        </div>

        <div className="cmd-screen-right">
          <span className="cmd-screen-label">Project Milestones</span>

          {milestones.length === 0 ? (
            <div className="cmd-screen-empty">
              No milestones tracked yet
            </div>
          ) : (
            <ul className="cmd-screen-milestones">
              {milestones.slice(0, 4).map((milestone) => {
                const pct = clampPct(milestone.progress);
                const tone = statusTone(milestone.status);

                return (
                  <li key={milestone.id} className="cmd-sm-row">
                    <span className={`cmd-sm-dot sm-${tone}`}></span>
                    <span className="cmd-sm-name">{milestone.phase}</span>
                    <span className="cmd-sm-bar">
                      <span
                        className={`sm-${tone}`}
                        style={{ "--w": `${pct}%` }}
                      ></span>
                    </span>
                    <strong className="cmd-sm-pct">{pct}%</strong>
                  </li>
                );
              })}
            </ul>
          )}

          <span className="cmd-screen-label cmd-trend-label">
            Progress Trend
          </span>

          {series.length === 0 ? (
            <div className="cmd-screen-empty cmd-screen-empty-trend">
              No progress data recorded yet
            </div>
          ) : (
            <div className="cmd-trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 7.5, fill: SCREEN.label }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 7.5, fill: SCREEN.label }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTip unit="%" />}
                    cursor={{ stroke: "rgba(255,255,255,0.18)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    name="Progress"
                    stroke={SCREEN.accent}
                    strokeWidth={1.6}
                    fill={SCREEN.accent}
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= SKELETON / ERROR BUILDERS =================

function SkeletonPanel() {
  return (
    <>
      <div className="cmd-panel">
        <div className="cmd-panel-head">
          <div className="cmd-skeleton cmd-sk-kicker"></div>
          <div className="cmd-skeleton cmd-sk-badge"></div>
        </div>

        <div className="cmd-skeleton cmd-sk-title"></div>
        <div className="cmd-skeleton cmd-sk-sub"></div>

        <div className="cmd-metric-row">
          {[0, 1, 2].map((i) => (
            <div className="cmd-skeleton cmd-sk-metric" key={i}></div>
          ))}
        </div>

        <div className="cmd-skeleton cmd-sk-screen"></div>
      </div>

      <div className="cmd-panel">
        <div className="cmd-panel-head">
          <div className="cmd-skeleton cmd-sk-kicker"></div>
          <div className="cmd-skeleton cmd-sk-badge"></div>
        </div>

        <div className="cmd-skeleton cmd-sk-title"></div>
        <div className="cmd-skeleton cmd-sk-sub"></div>

        <div className="cmd-telemetry">
          {[0, 1, 2, 3].map((i) => (
            <div className="cmd-skeleton cmd-sk-tel" key={i}></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ================= DASHBOARD =================

function CommandCenter() {
  const wrapRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data) return;
    const grid = wrapRef.current;
    if (!grid) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const timeouts = [];
    grid.querySelectorAll(".cmd-panel").forEach((el, index) => {
      if (el.classList.contains("in-view")) return;
      timeouts.push(
        window.setTimeout(
          () => el.classList.add("in-view"),
          reduced ? 0 : index * 100 + 180
        )
      );
    });
    return () => timeouts.forEach((id) => window.clearTimeout(id));
  }, [data]);

  useEffect(() => {
    let active = true;

    const fetchMetrics = async () => {
      try {
        const response = await api.get("/dashboard/metrics");
        if (!active) return;

        if (response.data && response.data.success) {
          setData(response.data);
          setError(null);
        } else {
          setError("The live dashboard returned an unexpected response.");
        }
      } catch (err) {
        if (!active) return;
        setError(
          err.response?.data?.message ||
            "Unable to reach the live data service. The dashboard will retry automatically."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMetrics();
    const pollId = setInterval(fetchMetrics, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(pollId);
    };
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);

    const attempt = async () => {
      try {
        const response = await api.get("/dashboard/metrics");
        if (response.data && response.data.success) {
          setData(response.data);
          setError(null);
        } else {
          setError("The live dashboard returned an unexpected response.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to reach the live data service."
        );
      } finally {
        setLoading(false);
      }
    };

    attempt();
  };

  const pm = data?.projectManager;
  const adm = data?.administrator;

  const stageTone = pm?.stage
    ? statusTone(pm.stage.status)
    : "success";

  const operational = Boolean(adm?.systemHealth?.operational);

  const animatedProgress = useAnimatedValue(pm?.progress);
  const animatedBudget = useAnimatedValue(pm?.budgetUtilization);
  const animatedCrew = useAnimatedValue(pm?.activeCrew?.active);
  const animatedUsers = useAnimatedValue(adm?.users);
  const animatedActiveProjects = useAnimatedValue(adm?.activeProjects);
  const animatedDailyActivity = useAnimatedValue(adm?.dailyActivity);

  const animated = {
    progress: animatedProgress,
    budget: animatedBudget,
    crew: animatedCrew,
    users: animatedUsers,
    activeProjects: animatedActiveProjects,
    dailyActivity: animatedDailyActivity,
  };

  return (
    <div className="cmd-wrap" ref={wrapRef}>
      {loading ? (
        <div className="cmd-grid" role="status" aria-live="polite">
          <SkeletonPanel />
        </div>
      ) : error && !data ? (
        <div className="cmd-error" role="alert">
          <span className="cmd-error-icon">
            <AlertTriangle size={18} />
          </span>

          <h3>Dashboard data unavailable</h3>
          <p>{error}</p>

          <button className="btn btn-primary" onClick={retry}>
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : pm && adm ? (
        <div className="cmd-grid">
          {/* ================= LEFT — PROJECT MANAGER ================= */}
          <div className="cmd-panel cmd-panel-pm">
            <div className="cmd-panel-head">
              <div className="cmd-panel-title">
                <span className="cmd-kicker">Project Manager View</span>

                <h3>Project Manager View</h3>

                <span className="cmd-panel-sub">
                  {pm.stage
                    ? pm.stage.name
                    : "No active construction stage"}
                </span>
              </div>

              {pm.stage && (
                <span className={`cmd-badge badge-${stageTone}`}>
                  <span className="cmd-badge-dot"></span>
                  {pm.stage.status || "Awaiting data"}
                </span>
              )}
            </div>

            <div className="cmd-metric-row">
              <MetricCard
                label="Overall Progress"
                value={Math.round(animatedProgress)}
                unit="%"
                sub={`Average across ${adm.totalProjects} projects`}
                bar={pm.progress}
              />

              <MetricCard
                label="Budget Utilization"
                value={Math.round(animatedBudget)}
                unit="%"
                tone="green"
                sub={`₹ ${formatCrores(pm.budget.spent)} Cr of ₹ ${formatCrores(pm.budget.total)} Cr`}
                bar={pm.budgetUtilization}
              />

              <MetricCard
                label="Active Crew"
                value={Math.round(animatedCrew)}
                unit={pm.activeCrew.total ? ` / ${pm.activeCrew.total}` : ""}
                tone="green"
                sub="Crew on site · latest shift record"
                bar={
                  pm.activeCrew.total > 0
                    ? (pm.activeCrew.active / pm.activeCrew.total) * 100
                    : 0
                }
              />
            </div>

            <CommandScreen pm={pm} adm={adm} animated={animated} />
          </div>

          {/* ================= RIGHT — ADMINISTRATOR ================= */}
          <div className="cmd-panel cmd-panel-admin">
            <div className="cmd-panel-head">
              <div className="cmd-panel-title">
                <span className="cmd-kicker">Administrator Dashboard</span>

                <h3>Centralized System Telemetry</h3>

                <span className="cmd-panel-sub">
                  Platform-wide operational metrics
                </span>
              </div>

              <span
                className={`cmd-badge badge-${operational ? "success" : "danger"}`}
              >
                <span className="cmd-badge-dot"></span>
                {operational ? "Operational" : "Degraded"}
              </span>
            </div>

            <div className="cmd-telemetry">
              <TelemetryCard
                label="Global Users"
                value={Math.round(animatedUsers).toLocaleString("en-US")}
                sub="Registered platform accounts"
                ok={operational}
              />

              <TelemetryCard
                label="Active Projects"
                value={Math.round(animatedActiveProjects).toLocaleString("en-US")}
                sub={`${formatNumber(adm.totalProjects)} total · ${formatNumber(adm.completedProjects)} completed`}
                ok={operational}
              />

              <TelemetryCard
                label="Daily Activity Stream"
                value={Math.round(animatedDailyActivity).toLocaleString("en-US")}
                sub="Events in the last 24 hours"
                ok={operational}
              />

              <TelemetryCard
                label="Active API Webhooks"
                value={operational ? "Operational" : "Offline"}
                sub={`${formatNumber(adm.systemHealth.totalRecords)} records · ${formatNumber(adm.systemHealth.dataModels)} data modules`}
                ok={operational}
                state
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="cmd-error" role="alert">
          <span className="cmd-error-icon">
            <AlertTriangle size={18} />
          </span>

          <h3>Dashboard data unavailable</h3>
          <p>No metrics could be loaded from the database.</p>
        </div>
      )}
    </div>
  );
}

export default CommandCenter;