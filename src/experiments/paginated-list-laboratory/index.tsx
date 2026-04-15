import { useMemo, useState } from 'react';
import './styles.css';

// ──────────────────────────────────────────────
// サンプルデータ
// ──────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const USERS: User[] = Array.from({ length: 47 }, (_, i) => {
  const roles = ['管理者', '編集者', '閲覧者'];
  const statuses: User['status'][] = ['active', 'inactive'];
  return {
    id: i + 1,
    name: `ユーザー ${String(i + 1).padStart(2, '0')}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % roles.length],
    status: statuses[i % 3 === 2 ? 1 : 0],
  };
});

const PRODUCTS: Product[] = Array.from({ length: 63 }, (_, i) => {
  const categories = ['電子機器', '書籍', '食品', 'ファッション', 'スポーツ'];
  return {
    id: i + 1,
    name: `商品 ${String(i + 1).padStart(3, '0')}`,
    category: categories[i % categories.length],
    price: Math.floor((i + 1) * 1234.5) % 50000 + 500,
    stock: Math.floor(Math.abs(Math.sin(i + 1) * 100)),
  };
});

// ──────────────────────────────────────────────
// 共通ページングフック
// ──────────────────────────────────────────────

function usePagination<T>(items: T[], pageSize: number) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // items や pageSize が変わったときに範囲外ページを補正する
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const goTo = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return { currentPage: safePage, totalPages, pageItems, goTo };
}

// ──────────────────────────────────────────────
// 共通ページネーション UI
// ──────────────────────────────────────────────

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onGoTo: (page: number) => void;
}

function Paginator({ currentPage, totalPages, totalItems, pageSize, onGoTo }: PaginatorProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // 表示するページ番号の範囲（前後 2 ページ）
  const pages: (number | '...')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="paginator">
      <span className="paginator-summary">
        {totalItems} 件中 {start}–{end} 件を表示
      </span>
      <div className="paginator-controls">
        <button
          className="paginator-btn"
          disabled={currentPage === 1}
          onClick={() => onGoTo(1)}
          aria-label="最初のページ"
        >
          «
        </button>
        <button
          className="paginator-btn"
          disabled={currentPage === 1}
          onClick={() => onGoTo(currentPage - 1)}
          aria-label="前のページ"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="paginator-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`paginator-btn${p === currentPage ? ' paginator-btn--active' : ''}`}
              onClick={() => onGoTo(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="paginator-btn"
          disabled={currentPage === totalPages}
          onClick={() => onGoTo(currentPage + 1)}
          aria-label="次のページ"
        >
          ›
        </button>
        <button
          className="paginator-btn"
          disabled={currentPage === totalPages}
          onClick={() => onGoTo(totalPages)}
          aria-label="最後のページ"
        >
          »
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// パターン 1: 固定ページサイズ
// ──────────────────────────────────────────────

function BasicPaginatedTable() {
  const PAGE_SIZE = 10;
  const { currentPage, totalPages, pageItems, goTo } = usePagination(USERS, PAGE_SIZE);

  return (
    <section className="pag-section">
      <h3>1. 固定ページサイズ</h3>
      <p className="pag-description">
        1 ページあたりの表示件数を固定（10 件）したシンプルなページング。
        <code>usePagination</code> フックが現在ページ・総ページ数・スライス済みデータを返します。
      </p>

      <div className="table-wrapper">
        <table className="pag-table">
          <thead>
            <tr>
              <th>#</th>
              <th>名前</th>
              <th>メール</th>
              <th>役割</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((user) => (
              <tr key={user.id}>
                <td className="col-id">{user.id}</td>
                <td>{user.name}</td>
                <td className="col-email">{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`badge badge--${user.status}`}>
                    {user.status === 'active' ? '有効' : '無効'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={USERS.length}
        pageSize={PAGE_SIZE}
        onGoTo={goTo}
      />
    </section>
  );
}

// ──────────────────────────────────────────────
// パターン 2: ページサイズ切り替え
// ──────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

function PageSizeSwitchTable() {
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const { currentPage, totalPages, pageItems, goTo } = usePagination(PRODUCTS, pageSize);

  const handlePageSizeChange = (value: number) => {
    setPageSize(value as (typeof PAGE_SIZE_OPTIONS)[number]);
    goTo(1);
  };

  return (
    <section className="pag-section">
      <h3>2. ページサイズ切り替え</h3>
      <p className="pag-description">
        セレクトボックスで 1 ページあたりの表示件数を動的に変更できます。
        ページサイズ変更時は自動的に先頭ページへ戻ります。
      </p>

      <div className="pag-toolbar">
        <label className="page-size-label">
          表示件数：
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="page-size-select"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} 件
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrapper">
        <table className="pag-table">
          <thead>
            <tr>
              <th>#</th>
              <th>商品名</th>
              <th>カテゴリ</th>
              <th>価格</th>
              <th>在庫</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((product) => (
              <tr key={product.id}>
                <td className="col-id">{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td className="col-price">¥{product.price.toLocaleString()}</td>
                <td>
                  <span className={`badge ${product.stock === 0 ? 'badge--inactive' : 'badge--active'}`}>
                    {product.stock === 0 ? '在庫切れ' : `${product.stock} 個`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={PRODUCTS.length}
        pageSize={pageSize}
        onGoTo={goTo}
      />
    </section>
  );
}

// ──────────────────────────────────────────────
// パターン 3: 検索＋ソート＋ページング
// ──────────────────────────────────────────────

type SortKey = 'id' | 'name' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';

function SearchSortPaginatedTable() {
  const PAGE_SIZE = 8;
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const categories = useMemo(() => {
    return ['', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [query, categoryFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const { currentPage, totalPages, pageItems, goTo } = usePagination(sorted, PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    goTo(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    goTo(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    goTo(1);
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <span className="sort-icon sort-icon--none">⇅</span>;
    return <span className="sort-icon sort-icon--active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <section className="pag-section">
      <h3>3. 検索・ソート・ページング</h3>
      <p className="pag-description">
        テキスト検索・カテゴリフィルター・列ソートをすべて組み合わせたパターン。
        フィルターやソートが変わると自動的に 1 ページ目へリセットされます。
      </p>

      <div className="pag-toolbar pag-toolbar--row">
        <input
          type="search"
          className="search-input"
          placeholder="商品名・カテゴリで検索…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        <select
          className="page-size-select"
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === '' ? 'すべてのカテゴリ' : c}
            </option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="pag-empty">該当する商品が見つかりません。</p>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="pag-table pag-table--sortable">
              <thead>
                <tr>
                  <th className="col-sortable" onClick={() => handleSort('id')}>
                    # {sortIcon('id')}
                  </th>
                  <th className="col-sortable" onClick={() => handleSort('name')}>
                    商品名 {sortIcon('name')}
                  </th>
                  <th>カテゴリ</th>
                  <th className="col-sortable" onClick={() => handleSort('price')}>
                    価格 {sortIcon('price')}
                  </th>
                  <th className="col-sortable" onClick={() => handleSort('stock')}>
                    在庫 {sortIcon('stock')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((product) => (
                  <tr key={product.id}>
                    <td className="col-id">{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td className="col-price">¥{product.price.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${product.stock === 0 ? 'badge--inactive' : 'badge--active'}`}>
                        {product.stock === 0 ? '在庫切れ' : `${product.stock} 個`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            onGoTo={goTo}
          />
        </>
      )}
    </section>
  );
}

// ──────────────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────────────

function PaginatedListLaboratory() {
  return (
    <div className="pag-lab">
      <h2>Paginated List Laboratory</h2>
      <p className="pag-intro">
        ページング付き一覧表の 3 つのパターンを試せる実験室です。共通の{' '}
        <code>usePagination</code> フックを軸に、固定サイズ・サイズ切り替え・検索&amp;ソートの
        各バリエーションを実装しています。
      </p>

      <BasicPaginatedTable />
      <PageSizeSwitchTable />
      <SearchSortPaginatedTable />
    </div>
  );
}

export default PaginatedListLaboratory;
