import { Link } from 'react-router-dom';

function Navbar() {
  const navStyle = {
    backgroundColor: '#003366',
    padding: '15px 20px',
    display: 'flex',
    gap: '20px',
    borderRadius: '0 0 12px 12px',
    marginBottom: '20px'
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>🏠 Home</Link>
      <Link to="/gestao" style={linkStyle}>📋 Mesa de Controle</Link>
      <Link to="/telao" style={linkStyle}>📺 Telão</Link>
      <span style={{ color: '#00C9DB', marginLeft: 'auto', fontWeight: 'bold' }}>HOCKEYTOWN CWB</span>
    </nav>
  );
}

export default Navbar;