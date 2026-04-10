import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '../hooks/useGraphQL';
import { gqlSubscribe } from '../graphql/client';
import {
  GET_ORDERS, GET_USERS,
  CREATE_ORDER, UPDATE_ORDER_STATUS, DELETE_ORDER,
  SUB_ORDER_CREATED, SUB_ORDER_UPDATED, SUB_ORDER_DELETED,
} from '../graphql/operations';

const PAGE_SIZE = 10;

function Badge({ status }) {
  const map = {
    PENDING:   { bg: '#FAEEDA', color: '#854F0B', label: 'En attente' },
    CONFIRMED: { bg: '#EAF3DE', color: '#3B6D11', label: 'Confirmée' },
    CANCELLED: { bg: '#FCEBEB', color: '#A32D2D', label: 'Annulée' },
  };
  const s = map[status] || map.PENDING;
  return <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{s.label}</span>;
}

export default function Orders() {
  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [modal, setModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [notif, setNotif] = useState('');

  const vars = {
    page,
    size: PAGE_SIZE,
    filter: {
      status: filterStatus || null,
      userId: filterUser || null
    }
  };

  const { data: orderData, loading, error, refetch } = useQuery(GET_ORDERS, vars);
  const { data: userData } = useQuery(GET_USERS);
  const { mutate: doCreate, loading: createLoading } = useMutation(CREATE_ORDER);
  const { mutate: doUpdate, loading: updateLoading } = useMutation(UPDATE_ORDER_STATUS);
  const { mutate: doDelete, loading: deleteLoading } = useMutation(DELETE_ORDER);

  const orders = orderData?.orders?.content || [];
  const pageInfo = orderData?.orders?.pageInfo || {
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    currentPage: 0
  };
  const users = userData?.users || [];

  const showNotif = (msg, isError = false) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 2500);
  };

  // Log des erreurs
  useEffect(() => {
    if (error) console.error('Orders query error:', error);
  }, [error]);

  // Subscriptions
  useEffect(() => {
    let u1, u2, u3;
    try {
      u1 = gqlSubscribe(SUB_ORDER_CREATED,
        () => { refetch(); showNotif('📦 Nouvelle commande reçue'); },
        (err) => console.warn('Subscription orderCreated error:', err)
      );
      u2 = gqlSubscribe(SUB_ORDER_UPDATED,
        () => { refetch(); showNotif('✏️ Commande mise à jour'); },
        (err) => console.warn('Subscription orderUpdated error:', err)
      );
      u3 = gqlSubscribe(SUB_ORDER_DELETED,
        () => { refetch(); showNotif('🗑️ Commande supprimée'); },
        (err) => console.warn('Subscription orderDeleted error:', err)
      );
    } catch (e) {
      console.warn('Subscriptions non disponibles:', e);
    }
    return () => {
      u1?.();
      u2?.();
      u3?.();
    };
  }, [refetch]);

  const handleCreate = async () => {
    if (!newUserId) {
      showNotif('❌ Veuillez sélectionner un utilisateur', true);
      return;
    }
    try {
      await doCreate({ userId: newUserId });
      showNotif('✅ Commande créée avec succès');
      setModal(false);
      setNewUserId('');
      refetch();
    } catch (error) {
      console.error('Create error:', error);
      showNotif('❌ Erreur lors de la création', true);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await doUpdate({ id, status });
      showNotif(`✅ Statut → ${status === 'PENDING' ? 'En attente' : status === 'CONFIRMED' ? 'Confirmée' : 'Annulée'}`);
      refetch();
    } catch (error) {
      console.error('Update error:', error);
      showNotif(`❌ Erreur lors du changement de statut`, true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette commande ?')) {
      try {
        await doDelete({ id });
        showNotif('✅ Commande supprimée');
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        showNotif('❌ Erreur lors de la suppression', true);
      }
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'status') setFilterStatus(value);
    if (type === 'user') setFilterUser(value);
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
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Total commandes</div>
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
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Utilisateurs</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{users.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filterStatus}
          onChange={e => handleFilterChange('status', e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13 }}
        >
          <option value="">Tous statuts</option>
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmée</option>
          <option value="CANCELLED">Annulée</option>
        </select>

        <select
          value={filterUser}
          onChange={e => handleFilterChange('user', e.target.value)}
          style={{ height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13 }}
        >
          <option value="">Tous utilisateurs</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <button
          onClick={() => setModal(true)}
          style={{ height: 34, padding: '0 14px', border: '0.5px solid #85B7EB', borderRadius: 8, background: 'none', color: '#0C447C', fontSize: 13, cursor: 'pointer' }}
        >
          + Nouvelle commande
        </button>
      </div>

      {/* Orders Table */}
      <div style={{ border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f3' }}>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>ID</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Utilisateur</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Statut</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Changer statut</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  ⏳ Chargement...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#A32D2D' }}>
                  ❌ Erreur: {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  📭 Aucune commande
                </td>
              </tr>
            ) : (
              orders.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{o.id}</td>
                  <td style={{ padding: '10px 14px' }}>{o.user?.name || '—'}</td>
                  <td style={{ padding: '10px 14px' }}><Badge status={o.status} /></td>
                  <td style={{ padding: '10px 14px' }}>
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                      disabled={updateLoading}
                      style={{ height: 28, padding: '0 8px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 12 }}
                    >
                      <option value="PENDING">En attente</option>
                      <option value="CONFIRMED">Confirmée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleDelete(o.id)}
                      disabled={deleteLoading}
                      style={{
                        padding: '4px 10px',
                        border: '0.5px solid #F09595',
                        borderRadius: 6,
                        background: 'none',
                        color: '#A32D2D',
                        fontSize: 12,
                        cursor: deleteLoading ? 'default' : 'pointer',
                        opacity: deleteLoading ? 0.5 : 1
                      }}
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
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', width: 300, border: '0.5px solid #ddd' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 500 }}>Nouvelle commande</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Utilisateur</label>
              <select
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                style={{ width: '100%', height: 34, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13 }}
              >
                <option value="">Sélectionner...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setModal(false)}
                style={{ padding: '6px 14px', border: '0.5px solid #ccc', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13 }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                style={{ padding: '6px 14px', border: '0.5px solid #85B7EB', borderRadius: 8, background: 'none', color: '#0C447C', cursor: createLoading ? 'default' : 'pointer', fontSize: 13 }}
              >
                {createLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}