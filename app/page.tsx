export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          METALID
        </h1>
        <p style={{
          fontSize: '20px',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          モルックコミュニティ向け金属製IDカード
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
            QRコードをスキャンして、あなたのプロフィールページにアクセスしてください。
          </p>
          <p style={{ fontSize: '14px', marginTop: '20px', opacity: 0.7 }}>
            例: metalid.jp/u/000001
          </p>
        </div>
      </div>
    </div>
  )
}