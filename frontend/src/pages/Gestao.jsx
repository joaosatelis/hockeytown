import { useEffect, useState } from 'react';

export default function Gestao() {
  const [socket, setSocket] = useState(null);
  const [eventos, setEventos] = useState([]);
  
  // Controles de interface
  const [modalGolAberto, setModalGolAberto] = useState(false);
  const [modalPunicaoAberto, setModalPunicaoAberto] = useState(false);
  
  // Estados dos formulários
  const [formGol, setFormGol] = useState({
    time: 'Casa', periodo: '1P', minuto: '', segundo: '', autor: '', ast1: '', ast2: ''
  });
  
  const [formPunicao, setFormPunicao] = useState({
    time: 'Casa', periodo: '1P', minuto: '', segundo: '', infrator: '', penalidade: 'Tripping', minutos_penalidade: 2
  });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const novoEvento = JSON.parse(event.data);
      setEventos((prev) => [novoEvento, ...prev]);
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleRegistrarGol = (e) => {
    e.preventDefault();
    if (socket) {
      socket.send(JSON.stringify({ tipo: 'GOL', ...formGol }));
      setModalGolAberto(false);
      setFormGol({ ...formGol, minuto: '', segundo: '', autor: '', ast1: '', ast2: '' });
    }
  };

  const handleRegistrarPunicao = (e) => {
    e.preventDefault();
    if (socket) {
      socket.send(JSON.stringify({ tipo: 'PUNICAO', ...formPunicao }));
      setModalPunicaoAberto(false);
      setFormPunicao({ ...formPunicao, minuto: '', segundo: '', infrator: '' });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* IDENTIFICAÇÃO DO JOGO */}
      <div style={{ background: '#222', color: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h4 style={{ margin: 0, color: '#888' }}>Sexta, 26 de Maio - Jogo #42</h4>
          <h2 style={{ margin: '5px 0 0 0' }}>CASA vs VISITANTE</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0 }}>PERÍODO ATUAL: 1P</h3>
          <p style={{ margin: 0, color: '#f8d210' }}>Status: Em andamento</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* PAINEL DE CONTROLE */}
        <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3>Ações da Mesa</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setModalGolAberto(true)} style={btnStyle('#28a745')}>
              🏒 Registrar Gol
            </button>
            <button onClick={() => setModalPunicaoAberto(true)} style={btnStyle('#dc3545')}>
              ⏱️ Controle de Punições
            </button>
            <button style={btnStyle('#007bff')}>
              🥅 Registrar Chute a Gol (SOG)
            </button>
            <button style={btnStyle('#6c757d')}>
              🔄 Trocar Período
            </button>
          </div>
        </div>

        {/* LOG DE EVENTOS */}
        <div style={{ flex: 2, background: '#f8f9fa', padding: '20px', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto' }}>
          <h3>Súmula</h3>
          {eventos.length === 0 ? <p>Aguardando o puck cair...</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {eventos.map((ev, i) => (
                <li key={i} style={{ padding: '10px', borderBottom: '1px solid #dee2e6', background: '#fff', marginBottom: '5px', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>{ev.periodo} - {ev.minuto}:{ev.segundo}</span> | 
                  
                  {ev.tipo === 'GOL' ? (
                    <>
                      <strong style={{ color: '#28a745' }}> GOL ({ev.time})</strong> - Marcado por #{ev.autor} 
                      {ev.ast1 && ` (Ast: #${ev.ast1}${ev.ast2 ? `, #${ev.ast2}` : ''})`}
                    </>
                  ) : ev.tipo === 'PUNICAO' ? (
                    <>
                      <strong style={{ color: '#dc3545' }}> PUNIÇÃO ({ev.time})</strong> - #{ev.infrator} 
                      <span style={{ color: '#666' }}> ({ev.minutos_penalidade} min - {ev.penalidade})</span>
                    </>
                  ) : (
                    <strong> {ev.tipo}</strong>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* MODAL DE GOL */}
      {modalGolAberto && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Registrar Gol</h2>
            <form onSubmit={handleRegistrarGol}>
              <div style={formRow}>
                <label>Time:</label>
                <select value={formGol.time} onChange={e => setFormGol({...formGol, time: e.target.value})}>
                  <option value="Casa">Casa</option>
                  <option value="Visitante">Visitante</option>
                </select>
              </div>
              <div style={formRow}>
                <label>Tempo (Relógio):</label>
                <div>
                  <input type="number" placeholder="Min" value={formGol.minuto} onChange={e => setFormGol({...formGol, minuto: e.target.value})} style={{ width: '60px' }} required /> : 
                  <input type="number" placeholder="Seg" value={formGol.segundo} onChange={e => setFormGol({...formGol, segundo: e.target.value})} style={{ width: '60px' }} required />
                </div>
              </div>
              <div style={formRow}>
                <label>Autor do Gol (Nº):</label>
                <input type="number" value={formGol.autor} onChange={e => setFormGol({...formGol, autor: e.target.value})} required />
              </div>
              <div style={formRow}>
                <label>Assistência 1 (Nº):</label>
                <input type="number" value={formGol.ast1} onChange={e => setFormGol({...formGol, ast1: e.target.value})} />
              </div>
              <div style={formRow}>
                <label>Assistência 2 (Nº):</label>
                <input type="number" value={formGol.ast2} onChange={e => setFormGol({...formGol, ast2: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={btnStyle('#28a745')}>Salvar Gol</button>
                <button type="button" onClick={() => setModalGolAberto(false)} style={btnStyle('#6c757d')}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PUNIÇÃO */}
      {modalPunicaoAberto && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Controle de Punição</h2>
            <form onSubmit={handleRegistrarPunicao}>
              <div style={formRow}>
                <label>Time:</label>
                <select value={formPunicao.time} onChange={e => setFormPunicao({...formPunicao, time: e.target.value})}>
                  <option value="Casa">Casa</option>
                  <option value="Visitante">Visitante</option>
                </select>
              </div>
              <div style={formRow}>
                <label>Tempo da Falta:</label>
                <div>
                  <input type="number" placeholder="Min" value={formPunicao.minuto} onChange={e => setFormPunicao({...formPunicao, minuto: e.target.value})} style={{ width: '60px' }} required /> : 
                  <input type="number" placeholder="Seg" value={formPunicao.segundo} onChange={e => setFormPunicao({...formPunicao, segundo: e.target.value})} style={{ width: '60px' }} required />
                </div>
              </div>
              <div style={formRow}>
                <label>Infrator (Nº):</label>
                <input type="number" value={formPunicao.infrator} onChange={e => setFormPunicao({...formPunicao, infrator: e.target.value})} required />
              </div>
              <div style={formRow}>
                <label>Infração:</label>
                <select value={formPunicao.penalidade} onChange={e => setFormPunicao({...formPunicao, penalidade: e.target.value})}>
                  <option value="Tripping">Tripping (Rasteira)</option>
                  <option value="Slashing">Slashing (Golpe de Taco)</option>
                  <option value="Roughing">Roughing (Agressão Leve)</option>
                  <option value="Hooking">Hooking (Gancho)</option>
                  <option value="Interference">Interference (Interferência)</option>
                  <option value="Delay of Game">Delay of Game</option>
                </select>
              </div>
              <div style={formRow}>
                <label>Duração:</label>
                <select value={formPunicao.minutos_penalidade} onChange={e => setFormPunicao({...formPunicao, minutos_penalidade: Number(e.target.value)})}>
                  <option value={2}>2 Minutos (Minor)</option>
                  <option value={4}>4 Minutos (Double Minor)</option>
                  <option value={5}>5 Minutos (Major)</option>
                  <option value={10}>10 Minutos (Misconduct)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={btnStyle('#dc3545')}>Aplicar Punição</button>
                <button type="button" onClick={() => setModalPunicaoAberto(false)} style={btnStyle('#6c757d')}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (cor) => ({ padding: '12px', background: cor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' });
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '8px', width: '400px' };
const formRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' };