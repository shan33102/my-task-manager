/**
 * 统计面板：任务总数 / 已完成 / 未完成 / 完成率
 */
export default function StatsPanel({ total, done, todo, rate }) {
  return (
    <section className="stats">
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{total}</span>
          <span className="stat-label">总任务</span>
        </div>
        <div className="stat stat--done">
          <span className="stat-value">{done}</span>
          <span className="stat-label">已完成</span>
        </div>
        <div className="stat stat--todo">
          <span className="stat-value">{todo}</span>
          <span className="stat-label">未完成</span>
        </div>
      </div>

      <div className="progress">
        <div className="progress-top">
          <span>完成率</span>
          <span className="progress-rate">{rate}%</span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={rate}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="progress-fill" style={{ width: `${rate}%` }} />
        </div>
      </div>
    </section>
  );
}
