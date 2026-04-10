import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '../hooks/useGraphQL';
import { GET_USERS, GET_ORDERS, DELETE_USER } from '../graphql/operations';

export default function Users() {
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS);
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ORDERS, { page: 0, size: 100 });
  const { mutate: deleteUser } = useMutation(DELETE_USER);
  const [notif, setNotif] = useState('');

  const users = usersData?.users || [];
  const orders = ordersData?.orders?.content || [];

  const showNotif = (msg, isError = false) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 2500);
  };

  const getOrderCount = (userId) => {
    return orders.filter(order => order.user?.id === userId).length;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        await deleteUser({ id });
        showNotif('✅ Utilisateur supprimé');
        refetchUsers();
      } catch (error) {
        console.error('Delete error:', error);
        showNotif('❌ Erreur lors de la suppression', true);
      }
    }
  };

  if (usersLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Chargement...</div>;
  if (usersError) return <div style={{ padding: '2rem', textAlign: 'center', color: '#A32D2D' }}>❌ Erreur: {usersError}</div>;

  return (
    <div>
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
          fontSize: 13
        }}>
          {notif}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Total utilisateurs</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{users.length}</div>
        </div>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Total commandes</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{orders.length}</div>
        </div>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Commandes/Utilisateur</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{(orders.length / users.length).toFixed(1) || 0}</div>
        </div>
      </div>

      <div style={{ border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f3' }}>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>ID</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Nom</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Nombre commandes</th>
              <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, color: '#888', borderBottom: '0.5px solid #e5e5e5' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  📭 Aucun utilisateur
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{u.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {ordersLoading ? '...' : getOrderCount(u.id)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{
                        padding: '4px 10px',
                        border: '0.5px solid #F09595',
                        borderRadius: 6,
                        background: 'none',
                        color: '#A32D2D',
                        fontSize: 12,
                        cursor: 'pointer'
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
    </div>
  );
}