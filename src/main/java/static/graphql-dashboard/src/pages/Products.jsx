import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '../hooks/useGraphQL';
import { gqlSubscribe } from '../graphql/client';
import {
  GET_PRODUCTS, GET_CATEGORIES,
  CREATE_PRODUCT, DELETE_PRODUCT,
  SUB_PRODUCT_CREATED, SUB_PRODUCT_DELETED,
} from '../graphql/operations';

const PAGE_SIZE = 10;

function Badge({ type, children }) {
  const styles = {
    green:  { background: '#EAF3DE', color: '#3B6D11' },
    amber:  { background: '#FAEEDA', color: '#854F0B' },
    red:    { background: '#FCEBEB', color: '#A32D2D' },
    blue:   { background: '#E6F1FB', color: '#0C447C' },
  };
  const s = styles[type] || styles.blue;
  return (
    <span style={{ ...s, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, categories, onSaved }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '', categoryId: '' });
  const { mutate, loading } = useMutation(CREATE_PRODUCT);

  useEffect(() => {
    if (open) setForm({ name: '', price: '', stock: '', categoryId: '' });
  }, [open]);

  const submit = async () => {
    if (!form.name || !form.price) {
      alert('Veuillez remplir le nom et le prix');
      return;
    }
    try {
      await mutate({
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        categoryId: form.categoryId || null
      });
      onSaved();
      onClose();
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création du produit');
    }
  };

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', width: 320, border: '0.5px solid #ddd' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 500 }}>Nouveau produit</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Nom</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Prix (€)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            style={{ width: '100%', height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
            style={{ width: '100%', height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Catégorie</label>
          <select
            value={form.categoryId}
            onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
            style={{ width: '100%', height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13 }}
          >
            <option value="">Aucune</option>
            {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={onClose}
            style={{ padding: '6px 14px', border: '0.5px solid #ccc', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13 }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            style={{ padding: '6px 14px', border: '0.5px solid #85B7EB', borderRadius: 8, background: 'none', color: '#0C447C', cursor: 'pointer', fontSize: 13 }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState({ name: '', minPrice: null, maxPrice: null, categoryId: null });
  const [sort, setSort] = useState({ field: 'NAME', direction: 'ASC' }); // Changé: 'name' → 'NAME'
  const [modal, setModal] = useState(false);
  const [notif, setNotif] = useState('');

  const vars = {
    page,
    size: PAGE_SIZE,
    filter: {
      name: filter.name || null,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      categoryId: filter.categoryId
    },
    sort: {
      field: sort.field,      // 'NAME', 'PRICE', etc.
      direction: sort.direction  // 'ASC' ou 'DESC'
    },
  };

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, vars);
  const { data: catData, error: catError } = useQuery(GET_CATEGORIES);
  const { mutate: doDelete } = useMutation(DELETE_PRODUCT);

  const products = data?.products?.content || [];
  const pageInfo = data?.products?.pageInfo || { totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false, currentPage: 0 };
  const categories = catData?.categories || [];

  const showNotif = (msg, isError = false) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 2500);
  };

  // Log des erreurs
  useEffect(() => {
    if (error) console.error('Query error:', error);
    if (catError) console.error('Categories error:', catError);
  }, [error, catError]);

  // Subscriptions
  useEffect(() => {
    let unsub1, unsub2;

    const setupSubscriptions = () => {
      try {
        unsub1 = gqlSubscribe(
          SUB_PRODUCT_CREATED,
          () => {
            refetch();
            showNotif('📦 Nouveau produit reçu en temps réel');
          },
          (err) => console.warn('Subscription productCreated error:', err)
        );

        unsub2 = gqlSubscribe(
          SUB_PRODUCT_DELETED,
          () => {
            refetch();
            showNotif('🗑️ Produit supprimé en temps réel');
          },
          (err) => console.warn('Subscription productDeleted error:', err)
        );
      } catch (e) {
        console.warn('Subscriptions non disponibles:', e);
      }
    };

    setupSubscriptions();

    return () => {
      if (unsub1) unsub1();
      if (unsub2) unsub2();
    };
  }, [refetch]);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      try {
        await doDelete({ id });
        showNotif('✅ Produit supprimé');
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        showNotif('❌ Erreur lors de la suppression', true);
      }
    }
  };

  const handleSort = (e) => {
    const [field, direction] = e.target.value.split('-');
    setSort({
      field: field.toUpperCase(),  // Assure que c'est en majuscules pour l'enum
      direction: direction.toUpperCase()
    });
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    setFilter(p => ({ ...p, [key]: value }));
    setPage(0);
  };

  return (
    <div>
      {/* Notification */}
      {notif && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          background: notif.includes('❌') ? '#FCEBEB' : '#EAF3DE',
          color: notif.includes('❌') ? '#A32D2D' : '#3B6D11',
          border: `0.5px solid ${notif.includes('❌') ? '#F09595' : '#97C459'}`,
          borderRadius: 8,
          padding: '8px 16px',
          zIndex: 200,
          fontSize: 13,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {notif}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Total produits</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{pageInfo.totalElements ?? '—'}</div>
        </div>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Pages</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{pageInfo.totalPages ?? '—'}</div>
        </div>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Page actuelle</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{pageInfo.currentPage !== undefined ? pageInfo.currentPage + 1 : '—'}</div>
        </div>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Catégories</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{categories.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher..."
          value={filter.name}
          onChange={e => handleFilterChange('name', e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, width: 160 }}
        />
        <input
          type="number"
          placeholder="Prix min"
          value={filter.minPrice ?? ''}
          onChange={e => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, width: 90 }}
        />
        <input
          type="number"
          placeholder="Prix max"
          value={filter.maxPrice ?? ''}
          onChange={e => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, width: 90 }}
        />
        <select
          value={filter.categoryId ?? ''}
          onChange={e => handleFilterChange('categoryId', e.target.value || null)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13 }}
        >
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          onChange={handleSort}
          value={`${sort.field}-${sort.direction}`}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13 }}
        >
          <option value="NAME-ASC">Nom A→Z</option>
          <option value="NAME-DESC">Nom Z→A</option>
          <option value="PRICE-ASC">Prix ↑</option>
          <option value="PRICE-DESC">Prix ↓</option>
        </select>

        <button
          onClick={() => setModal(true)}
          style={{ height: 34, padding: '0 14px', border: '0.5px solid #85B7EB', borderRadius: 8, background: 'none', color: '#0C447C', fontSize: 13, cursor: 'pointer' }}
        >
          + Nouveau produit
        </button>
      </div>

      {/* Products Table */}
      <div style={{ border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f3' }}>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>#</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Nom</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Catégorie</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Prix</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Stock</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888', fontSize: 13 }}>
                  ⏳ Chargement...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#A32D2D', fontSize: 13 }}>
                  ❌ Erreur: {error}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888', fontSize: 13 }}>
                  📭 Aucun produit trouvé
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{p.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {p.category ? <Badge type="blue">{p.category.name}</Badge> : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>{p.price?.toLocaleString()} €</td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge type={p.stock > 10 ? 'green' : p.stock > 3 ? 'amber' : 'red'}>
                      {p.stock}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{
                        padding: '4px 10px',
                        border: '0.5px solid #F09595',
                        borderRadius: 6,
                        background: 'none',
                        color: '#A32D2D',
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.target.style.background = '#FCEBEB'; }}
                      onMouseLeave={e => { e.target.style.background = 'none'; }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!error && pageInfo.totalPages > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#888' }}>
            {pageInfo.totalElements ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, pageInfo.totalElements)} sur ${pageInfo.totalElements}` : ''}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!pageInfo.hasPrevious}
              style={{
                width: 30, height: 30, border: '0.5px solid #ccc', borderRadius: 8,
                background: 'none', cursor: pageInfo.hasPrevious ? 'pointer' : 'default',
                opacity: pageInfo.hasPrevious ? 1 : 0.4, fontSize: 13
              }}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(pageInfo.totalPages, 10) }, (_, i) => {
              let pageNum = i;
              if (pageInfo.totalPages > 10) {
                if (page < 5) pageNum = i;
                else if (page > pageInfo.totalPages - 5) pageNum = pageInfo.totalPages - 10 + i;
                else pageNum = page - 5 + i;
              }
              if (pageNum < 0 || pageNum >= pageInfo.totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    width: 30, height: 30, border: '0.5px solid #ccc', borderRadius: 8,
                    background: pageNum === page ? '#f5f5f3' : 'none',
                    cursor: 'pointer', fontSize: 13, fontWeight: pageNum === page ? 500 : 400
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pageInfo.hasNext}
              style={{
                width: 30, height: 30, border: '0.5px solid #ccc', borderRadius: 8,
                background: 'none', cursor: pageInfo.hasNext ? 'pointer' : 'default',
                opacity: pageInfo.hasNext ? 1 : 0.4, fontSize: 13
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        categories={categories}
        onSaved={() => {
          refetch();
          showNotif('✅ Produit créé avec succès');
        }}
      />
    </div>
  );
}