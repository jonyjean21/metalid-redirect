import { redirect } from 'next/navigation';
import { getUserData } from '@/lib/spreadsheet';
import ProfilePage from './profile';

export default async function UserPage({ params }: { params: { id: string } }) {
  const userData = await getUserData(params.id);

  if (!userData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
          <p style={{ fontSize: '20px' }}>ユーザーが見つかりません</p>
          <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>ID: {params.id}</p>
        </div>
      </div>
    );
  }

  if (userData.type === 'redirect' && userData.link1_url) {
    redirect(userData.link1_url);
  }

  return <ProfilePage userData={userData} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const userData = await getUserData(params.id);

  if (!userData) {
    return {
      title: 'ユーザーが見つかりません - METALID',
    };
  }

  return {
    title: `${userData.name || 'ユーザー'} - METALID`,
    description: userData.bio || 'モルックコミュニティメンバー',
  };
}