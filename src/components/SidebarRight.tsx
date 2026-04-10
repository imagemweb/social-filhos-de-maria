'use client'

export default function SidebarRight() {
  return (
    <aside
      style={{
        width: 350,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        padding: '12px 16px',
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'var(--text-secondary)' }}>
            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.276 4.276-1.414 1.414-4.276-4.276C13.815 17.818 12.986 18.5 11 18.5c0 0-8.5-3.806-8.5-8.5z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Pesquisar"
          style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid transparent',
            borderRadius: 9999,
            padding: '12px 16px 12px 44px',
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Trending widget */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>O que está acontecendo</h2>

        {[
          { meta: 'Música · Em alta', name: '#FilhosDeMariaApp' },
          { meta: 'Congregação · Em alta', name: 'Associação Filhos de Maria' },
          { meta: 'Fé · Em alta', name: '#MariaCheia deGraça' },
          { meta: 'Comunidade · Em alta', name: '#AFDM' },
        ].map((t) => (
          <div
            key={t.name}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '12px 0',
              cursor: 'pointer',
              gap: 8,
            }}
          >
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.meta}</p>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</p>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer' }}>
              ···
            </button>
          </div>
        ))}

        <a href="#" style={{ color: 'var(--accent)', fontSize: 14, display: 'block', marginTop: 12 }}>
          Ver mais
        </a>
      </div>
    </aside>
  )
}
