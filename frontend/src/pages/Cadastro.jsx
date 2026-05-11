import { useState, useEffect } from 'react';

export default function Cadastro() {
  const [aba, setAba] = useState('times');
  const [times, setTimes] = useState([]);
  
  // Estados dos formulários básicos
  const [nomeTime, setNomeTime] = useState('');
  const [cidade, setCidade] = useState('');
  const [nomeJogador, setNomeJogador] = useState('');
  const [numero, setNumero] = useState('');
  const [posicao, setPosicao] = useState('FW');
  const [timeIdSelecionado, setTimeIdSelecionado] = useState('');

  // Estados dos novos formulários (Staff e Arbitragem)
  const [nomeArbitro, setNomeArbitro] = useState('');
  const [tipoArbitro, setTipoArbitro] = useState('Referee');
  const [nomeMesario, setNomeMesario] = useState('');
  const [funcaoMesario, setFuncaoMesario] = useState('Scorekeeper');
  const [nomeTreinador, setNomeTreinador] = useState('');
  const [tipoTreinador, setTipoTreinador] = useState('Head Coach');

  // Carrega times para vincular jogadores e treinadores
  const carregarTimes = async () => {
    try {
      const res = await fetch('http://localhost:8000/times');
      const data = await res.json();
      setTimes(data);
    } catch (error) {
      console.error("Erro ao buscar times:", error);
    }
  };

  useEffect(() => { carregarTimes(); }, []);

  // Funções de salvamento (as novas apenas simulam o envio até criarmos o backend delas)
  const cadastrarTime = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/times', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeTime, cidade: cidade })
    });
    setNomeTime(''); setCidade(''); carregarTimes();
    alert('Time cadastrado!');
  };

  const cadastrarJogador = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/jogadores', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeJogador, numero_camisa: parseInt(numero), posicao: posicao, time_id: parseInt(timeIdSelecionado) })
    });
    setNomeJogador(''); setNumero('');
    alert('Jogador cadastrado!');
  };

  const cadastrarStaff = (e, tipo) => {
    e.preventDefault();
    // Aqui faremos o fetch real depois que criarmos as tabelas no backend
    alert(`${tipo} cadastrado com sucesso! (Simulado)`);
    if(tipo === 'Árbitro') setNomeArbitro('');
    if(tipo === 'Mesário') setNomeMesario('');
    if(tipo === 'Treinador') setNomeTreinador('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Painel de Cadastros da Liga</h1>
      
      {/* Menu de Abas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button onClick={() => setAba('times')} style={abaBtn(aba === 'times')}>Equipes</button>
        <button onClick={() => setAba('jogadores')} style={abaBtn(aba === 'jogadores')}>Jogadores</button>
        <button onClick={() => setAba('treinadores')} style={abaBtn(aba === 'treinadores')}>Treinadores</button>
        <button onClick={() => setAba('arbitros')} style={abaBtn(aba === 'arbitros')}>Árbitros</button>
        <button onClick={() => setAba('mesarios')} style={abaBtn(aba === 'mesarios')}>Mesários</button>
      </div>

      {/* Conteúdo das Abas */}
      {aba === 'times' && (
        <form onSubmit={cadastrarTime} style={formStyle}>
          <h3>Nova Equipe</h3>
          <input placeholder="Nome da Equipe" value={nomeTime} onChange={e => setNomeTime(e.target.value)} required style={inputStyle} />
          <input placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} style={inputStyle} />
          <button type="submit" style={saveBtn}>Salvar Equipe</button>
        </form>
      )}

      {aba === 'jogadores' && (
        <form onSubmit={cadastrarJogador} style={formStyle}>
          <h3>Novo Jogador</h3>
          <select value={timeIdSelecionado} onChange={e => setTimeIdSelecionado(e.target.value)} required style={inputStyle}>
            <option value="">Selecione a Equipe</option>
            {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <input placeholder="Nome do Atleta" value={nomeJogador} onChange={e => setNomeJogador(e.target.value)} required style={inputStyle} />
          <input placeholder="Nº Camisa" type="number" value={numero} onChange={e => setNumero(e.target.value)} required style={inputStyle} />
          <select value={posicao} onChange={e => setPosicao(e.target.value)} style={inputStyle}>
            <option value="GK">Goleiro (Goalie)</option>
            <option value="DF">Defesa</option>
            <option value="FW">Atacante (Forward)</option>
          </select>
          <button type="submit" style={saveBtn}>Salvar Jogador</button>
        </form>
      )}

      {aba === 'treinadores' && (
        <form onSubmit={(e) => cadastrarStaff(e, 'Treinador')} style={formStyle}>
          <h3>Novo Treinador</h3>
          <select value={timeIdSelecionado} onChange={e => setTimeIdSelecionado(e.target.value)} required style={inputStyle}>
            <option value="">Selecione a Equipe</option>
            {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <input placeholder="Nome do Treinador" value={nomeTreinador} onChange={e => setNomeTreinador(e.target.value)} required style={inputStyle} />
          <select value={tipoTreinador} onChange={e => setTipoTreinador(e.target.value)} style={inputStyle}>
            <option value="Head Coach">Treinador Principal (Head Coach)</option>
            <option value="Assistant Coach">Assistente (Assistant Coach)</option>
          </select>
          <button type="submit" style={saveBtn}>Salvar Treinador</button>
        </form>
      )}

      {aba === 'arbitros' && (
        <form onSubmit={(e) => cadastrarStaff(e, 'Árbitro')} style={formStyle}>
          <h3>Novo Árbitro</h3>
          <input placeholder="Nome do Árbitro" value={nomeArbitro} onChange={e => setNomeArbitro(e.target.value)} required style={inputStyle} />
          <select value={tipoArbitro} onChange={e => setTipoArbitro(e.target.value)} style={inputStyle}>
            <option value="Referee">Árbitro Principal (Referee)</option>
            <option value="Linesman">Juiz de Linha (Linesman)</option>
          </select>
          <button type="submit" style={saveBtn}>Salvar Árbitro</button>
        </form>
      )}

      {aba === 'mesarios' && (
        <form onSubmit={(e) => cadastrarStaff(e, 'Mesário')} style={formStyle}>
          <h3>Novo Membro da Mesa (Off-Ice Staff)</h3>
          <input placeholder="Nome do Mesário" value={nomeMesario} onChange={e => setNomeMesario(e.target.value)} required style={inputStyle} />
          <select value={funcaoMesario} onChange={e => setFuncaoMesario(e.target.value)} style={inputStyle}>
            <option value="Scorekeeper">Anotador da Súmula (Scorekeeper)</option>
            <option value="Timekeeper">Cronometrista (Timekeeper)</option>
            <option value="Penalty Box">Juiz da Caixa de Punição</option>
          </select>
          <button type="submit" style={saveBtn}>Salvar Mesário</button>
        </form>
      )}
    </div>
  );
}

const abaBtn = (ativo) => ({ padding: '10px 20px', cursor: 'pointer', background: ativo ? '#007bff' : '#eee', color: ativo ? '#fff' : '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' });
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', background: '#f9f9f9', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' };
const saveBtn = { padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };