import { useState } from 'react';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Categories  from './pages/Categories';
import Users from './pages/Users';

import { useQuery } from './hooks/useGraphQL';
import { GET_CATEGORIES, GET_USERS } from './graphql/operations';

const TABS = [
  { id: 'products',      label: '📦 Produits' },
  { id: 'orders',        label: '🛒 Commandes' },
  { id: 'categories',    label: '🏷️ Catégories' },
  { id: 'users',         label: '👥 Utilisateurs' },

];

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e9ecef' }}>
      <div style={{ fontSize: 28, fontWeight: 600, color, marginBottom: 4 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('products');

  const { data: productsData } = useQuery(`{ products(page: 0, size: 1) { pageInfo { totalElements } } }`);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: usersData }      = useQuery(GET_USERS);
  const { data: ordersData }     = useQuery(`{ orders { id } }`);

  const stats = {
    products:   productsData?.products?.pageInfo?.totalElements ?? '—',
    orders:     ordersData?.orders?.length ?? '—',
    categories: categoriesData?.categories?.length ?? '—',
    users:      usersData?.users?.length ?? '—',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#f5f7fb', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: '#1a1a2e' }}>📊 Dashboard GraphQL</h1>
        <p style={{ fontSize: 13, color: '#888' }}>Gestion des produits, commandes, catégories et utilisateurs</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Produits"     value={stats.products}   color="#3B6D11" />


        <StatCard label="Catégories"   value={stats.categories} color="#854F0B" />
        <StatCard label="Utilisateurs" value={stats.users}      color="#764ba2" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: 12,
              background: tab === t.id ? '#1a1a2e' : 'white',
              cursor: 'pointer', fontSize: 14,
              fontWeight: tab === t.id ? 600 : 500,
              color: tab === t.id ? 'white' : '#333',
              boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {tab === 'products'      && <Products />}
        {tab === 'orders'        && <Orders />}
        {tab === 'categories'    && <Categories />}
        {tab === 'users'         && <Users />}
        {tab === 'subscriptions' && <Subscriptions />}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#bbb', padding: 20 }}>
        GraphQL Dashboard — WebSocket temps réel | Pagination | Filtrage | Tri
      </div>
    </div>
  );
}
