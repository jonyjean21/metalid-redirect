'use client';

import { UserData } from '@/lib/spreadsheet';

interface Link {
  label: string;
  url: string;
}

function getLinks(userData: UserData): Link[] {
  const links: Link[] = [];
  
  for (let i = 1; i <= 5; i++) {
    const label = userData[`link${i}_label` as keyof UserData] as string;
    const url = userData[`link${i}_url` as keyof UserData] as string;
    
    if (label && url) {
      links.push({ label, url });
    }
  }
  
  return links;
}

export default function ProfilePage({ userData }: { userData: UserData }) {
  const links = getLinks(userData);

  return (<div style={{minHeight:'100vh',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',padding:'40px 20px',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:'100%',maxWidth:'480px',textAlign:'center'}}><div style={{width:'120px',height:'120px',borderRadius:'50%',background:'rgba(255, 255, 255, 0.2)',border:'4px solid rgba(255, 255, 255, 0.3)',margin:'0 auto 24px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px',color:'white',fontWeight:'bold'}}>{userData.name?.[0] || '?'}</div><h1 style={{fontSize:'32px',fontWeight:'bold',color:'white',marginBottom:'12px'}}>{userData.name || 'ユーザー'}</h1>{userData.bio && (<p style={{fontSize:'16px',color:'rgba(255, 255, 255, 0.9)',marginBottom:'40px',lineHeight:'1.5'}}>{userData.bio}</p>)}<div style={{display:'flex',flexDirection:'column',gap:'16px'}}>{links.map((link, index) => (<a key={index} href={link.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'16px 24px',background:'rgba(255, 255, 255, 0.95)',borderRadius:'12px',color:'#667eea',fontSize:'16px',fontWeight:'600',textDecoration:'none',transition:'all 0.3s ease',border:'2px solid transparent',cursor:'pointer'}} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)';e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';e.currentTarget.style.background = 'white';}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)';e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';}}>{link.label}</a>))}</div><div style={{marginTop:'60px',paddingTop:'20px',borderTop:'1px solid rgba(255, 255, 255, 0.2)'}}><p style={{fontSize:'12px',color:'rgba(255, 255, 255, 0.6)'}}>Powered by METALID</p></div></div></div>);
}