import { useEffect, useState } from 'react';

export default function Telao() {
  const [placarCasa, setPlacarCasa] = useState(0);
  const [placarVisitante, setPlacarVisitante] = useState(0);
  const [ultimoEvento, setUltimoEvento] = useState(null);

  useEffect(() => {
    // Conecta no mesmo canal que a página de Gestão usa
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const dados = JSON.parse(event.data);
      setUltimoEvento(dados);

      // Lê a mensagem e altera o placar automaticamente
      if (dados.tipo === 'GOL') {
        if (dados.time === 'Casa') setPlacarCasa((prev) => prev + 1);
        if (dados.time === 'Visitante') setPlacarVisitante((prev) => prev + 1);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ background: '#111', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#f8d210', letterSpacing: '2px', marginBottom: '10px' }}>HOCKEYTOWN CWB</h1>
      <p style={{ color: '#888', textTransform: 'uppercase', marginBottom: '40px' }}>Transmissão Ao Vivo</p>
      
      <div style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
        {/* Painel Casa */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>CASA</h2>
          <div style={{ background: '#222', fontSize: '8rem', fontWeight: 'bold', padding: '20px 50px', borderRadius: '12px', border: '2px solid #333' }}>
            {placarCasa}
          </div>
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#555' }}>X</div>

        {/* Painel Visitante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>VISITANTE</h2>
          <div style={{ background: '#222', fontSize: '8rem', fontWeight: 'bold', padding: '20px 50px', borderRadius: '12px', border: '2px solid #333' }}>
            {placarVisitante}
          </div>
        </div>
      </div>

      {/* Banner de última ação simulando o locutor */}
      <div style={{ marginTop: '60px', height: '40px' }}>
        {ultimoEvento && (
          <div style={{ background: '#28a745', color: '#fff', padding: '10px 30px', borderRadius: '20px', fontSize: '1.2rem', fontWeight: 'bold', animation: 'fadein 0.5s' }}>
            {ultimoEvento.tipo} PARA O TIME {ultimoEvento.time.toUpperCase()}! ({ultimoEvento.minuto}:{ultimoEvento.segundo} do {ultimoEvento.periodo})
          </div>
        )}
      </div>
    </div>
  );
}