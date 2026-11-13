import { FILTERS } from '../constants.js';
import { SearchIcon } from './icons.jsx';

/**
 * 工具栏：搜索框 + 优先级筛选按钮
 */
export default function Toolbar({ keyword, onKeywordChange, filter, onFilterChange }) {
  return (
    <div className="toolbar">
      <div className="search">
        <SearchIcon />
        <input
          className="field"
          type="text"
          placeholder="搜索任务标题"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>

      <div className="chips">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`chip ${filter === item.value ? 'is-active' : ''}`}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
