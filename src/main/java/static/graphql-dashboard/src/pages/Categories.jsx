import { useState } from 'react';
import { useQuery } from '../hooks/useGraphQL';
import { GET_CATEGORIES, GET_PRODUCTS } from '../graphql/operations';

export default function Categories() {
  const [search, setSearch] = useState('');
  const { data: catData, loading } = useQuery(GET_CATEGORIES);
  const { data: prodData }         = useQuery(GET_PRODUCTS, { page: 0, size: 100 });

  const categories = (catData?.categories || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const products = prodData?.products?.content || [];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
        <input type="text" placeholder="Rechercher..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, width: 200 }} />
        <span style={{ fontSize: 12, color: '#aaa' }}>{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f3' }}>
              {['ID', 'Nom', 'Produits'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Chargement...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Aucune catégorie</td></tr>
            ) : categories.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < categories.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                <td style={{ padding: '10px 14px', color: '#888' }}>{c.id}</td>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '10px 14px', color: '#888' }}>
                  {products.filter(p => p.category?.id === c.id).length} produits
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
