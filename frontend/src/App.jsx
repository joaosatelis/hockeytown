import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

function App() {
  // --- NAVEGAÇÃO ---
  const [telaAtiva, setTelaAtiva] = useState('gestao')

  // --- ESTADOS BÁSICOS ---
  const [times, setTimes] = useState([])
  const [nomeTime, setNomeTime] = useState('')
  const [cidadeTime, setCidadeTime] = useState('')

  const [jogadores, setJogadores] = useState([])
  const [nomeJogador, setNomeJogador] = useState('')
  const [numeroCamisa, setNumeroCamisa] = useState('')
  const [posicao, setPosicao] = useState('F')
  const [timeSelecionado, setTimeSelecionado] = useState('')

  const [partidas, setPartidas] = useState([])
  const [timeCasa, setTimeCasa] = useState('')
  const [timeVis, setTimeVis] = useState('')
  const [placarCasa, setPlacarCasa] = useState('')
  const [placarVis, setPlacarVis] = useState('')

  // --- ESTADOS DA SÚMULA ---
  const [partidaAtivaId, setPartidaAtivaId] = useState('')
  const [eventosPartida, setEventosPartida] = useState([])
  const [todosEventos, setTodosEventos] = useState([])
  
  const [periodo, setPeriodo] = useState('1ºP')
  const [tipoEvento, setTipoEvento] = useState('Gol')
  const [equipeAcao, setEquipeAcao] = useState('casa')
  const [jogadorEventoId, setJogadorEventoId] = useState('')
  const [assistencia1Id, setAssistencia1Id] = useState('')
  const [assistencia2Id, setAssistencia2Id] = useState('')
  const [nomePenalidade, setNomePenalidade] = useState('')
  const [minutosPenalidade, setMinutosPenalidade] = useState('')

  // --- ESTADOS DO PLACAR ---
  const [tempoSegundos, setTempoSegundos] = useState(1200)
  const [cronometroRodando, setCronometroRodando] = useState(false)
  const [golsCasaPlacar, setGolsCasaPlacar] = useState(0)
  const [golsVisPlacar, setGolsVisPlacar] = useState(0)
  const [penalidadesAtivas, setPenalidadesAtivas] = useState([])

  // --- REFERÊNCIA DO WEBSOCKET ---
  const ws = useRef(null)

  useEffect(() => { carregarDados() }, [])

  const carregarDados = () => {
    axios.get('http://localhost:8000/times').then(res => setTimes(res.data))
    axios.get('http://localhost:8000/jogadores').then(res => setJogadores(res.data))
    axios.get('http://localhost:8000/partidas').then(res => setPartidas(res.data))
    axios.get('http://localhost:8000/eventos').then(res => setTodosEventos(res.data))
  }

  useEffect(() => {
    if (partidaAtivaId) {
      axios.get(`http://localhost:8000/eventos/partida/${partidaAtivaId}`).then(res => setEventosPartida(res.data))
    }
  }, [partidaAtivaId])

  // --- CONEXÃO WEBSOCKET ---
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws')

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.tipo === 'GOL_CASA') setGolsCasaPlacar(data.valor)
      if (data.tipo === 'GOL_VISITANTE') setGolsVisPlacar(data.valor)
      if (data.tipo === 'STATUS_CRONOMETRO') {
        setCronometroRodando(data.valor)
        if (data.tempoSync !== undefined) setTempoSegundos(data.tempoSync)
      }
    }

    return () => ws.current.close()
  }, [])

  // --- MOTOR DO CRONÔMETRO E PENALIDADES ---
  useEffect(() => {
    let intervalo = null;
    if (cronometroRodando) {
      intervalo = setInterval(() => {
        if (tempoSegundos > 0) setTempoSegundos(t => t - 1)
        setPenalidadesAtivas(prev => 
          prev.map(p => ({ ...p, segundosRestantes: p.segundosRestantes - 1 }))
              .filter(p => p.segundosRestantes > 0)
        )
      }, 1000)
    }
    return () => clearInterval(intervalo)
  }, [cronometroRodando, tempoSegundos])

  const formatarTempo = (totalSegundos) => {
    const min = Math.floor(totalSegundos / 60)
    const seg = totalSegundos % 60
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
  }

  // --- AÇÕES DO PLACAR COM WEBSOCKET ---
  const handleGolCasa = () => {
    setGolsCasaPlacar(prev => {
      const novo = prev + 1
      if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ tipo: 'GOL_CASA', valor: novo }))
      return novo
    })
  }

  const handleGolVis = () => {
    setGolsVisPlacar(prev => {
      const novo = prev + 1
      if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ tipo: 'GOL_VISITANTE', valor: novo }))
      return novo
    })
  }

  const handleCronometro = () => {
    const novoStatus = !cronometroRodando
    setCronometroRodando(novoStatus)
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ 
        tipo: 'STATUS_CRONOMETRO', 
        valor: novoStatus, 
        tempoSync: tempoSegundos
      }))
    }
  }

  // --- FUNÇÕES DE CADASTRO BÁSICAS ---
  const cadastrarTime = (e) => {
    e.preventDefault()
    axios.post('http://localhost:8000/times', { nome: nomeTime, cidade: cidadeTime, logo_url: "" }).then(() => { carregarDados(); setNomeTime(''); setCidadeTime('') })
  }

  const cadastrarJogador = (e) => {
    e.preventDefault()
    const novoJogador = { nome: nomeJogador, numero_camisa: parseInt(numeroCamisa), posicao, time_id: parseInt(timeSelecionado) }
    axios.post('http://localhost:8000/jogadores', novoJogador).then(() => { carregarDados(); setNomeJogador(''); setNumeroCamisa(''); })
  }

  const cadastrarPartida = (e) => {
    e.preventDefault()
    const novaPartida = { 
      time_casa_id: parseInt(timeCasa), 
      time_visitante_id: parseInt(timeVis), 
      placar_casa: 0, 
      placar_visitante: 0, 
      status: "Em Andamento" 
    }
    axios.post('http://localhost:8000/partidas', novaPartida).then(() => { 
      carregarDados(); 
      setTimeCasa(''); 
      setTimeVis(''); 
      alert("Partida iniciada!");
    })
  }

  const alterarStatusPartida = (novoStatus) => {
    if (!partidaAtivaId) return;
    axios.put(`http://localhost:8000/partidas/${partidaAtivaId}/status`, { status: novoStatus })
      .then(() => {
        carregarDados();
        alert(`Partida marcada como: ${novoStatus}`);
      })
      .catch(err => console.error("Erro ao atualizar partida:", err));
  }

  const registrarEvento = (e) => {
    e.preventDefault()
    const m = Math.floor(tempoSegundos / 60)
    const s = tempoSegundos % 60
    const novoEvento = { 
      partida_id: parseInt(partidaAtivaId), periodo, minuto: m, segundo: s,
      jogador_id: parseInt(jogadorEventoId), tipo: tipoEvento,
      assistencia1_id: assistencia1Id ? parseInt(assistencia1Id) : null,
      assistencia2_id: assistencia2Id ? parseInt(assistencia2Id) : null,
      nome_penalidade: tipoEvento === 'Penalidade' ? nomePenalidade : null,
      minutos_penalidade: tipoEvento === 'Penalidade' ? parseInt(minutosPenalidade) : null
    }

    axios.post('http://localhost:8000/eventos', novoEvento).then(res => {
      setEventosPartida([...eventosPartida, res.data])

      // Espalha a atualização do placar para o telão automaticamente
      if (tipoEvento === 'Gol') {
        const partida = partidas.find(p => p.id === parseInt(partidaAtivaId))
        const jogador = jogadores.find(j => j.id === parseInt(jogadorEventoId))
        
        if (jogador && partida) {
          if (jogador.time_id === partida.time_casa_id) {
            handleGolCasa()
          } else {
            handleGolVis()
          }
        }
      }

      if (tipoEvento === 'Penalidade') {
        const jogador = jogadores.find(j => j.id === parseInt(jogadorEventoId))
        setPenalidadesAtivas([...penalidadesAtivas, {
          id: res.data.id, numero: jogador?.numero_camisa, time_id: jogador?.time_id, segundosRestantes: parseInt(minutosPenalidade) * 60
        }])
      }
      
      carregarDados()
      setAssistencia1Id(''); setAssistencia2Id(''); setNomePenalidade(''); setMinutosPenalidade('');
    })
  }

  // --- LÓGICA DE TABELAS E RANKINGS ---
  const getNomeTime = (id) => times.find(x => x.id === id)?.nome || '?'
  
  const gerarTabela = () => {
    let tabela = times.map(t => ({ id: t.id, nome: t.nome, pontos: 0, jogos: 0, vitorias: 0, derrotas: 0, saldo: 0 }))
    partidas.forEach(p => {
      let tCasa = tabela.find(t => t.id === p.time_casa_id), tVis = tabela.find(t => t.id === p.time_visitante_id)
      if (tCasa && tVis) {
        tCasa.jogos++; tVis.jogos++;
        tCasa.saldo += (p.placar_casa - p.placar_visitante); tVis.saldo += (p.placar_visitante - p.placar_casa);
        if (p.status === 'Finalizado') {
          if (p.placar_casa > p.placar_visitante) { tCasa.pontos += 3; tCasa.vitorias++; tVis.derrotas++; }
          else if (p.placar_casa < p.placar_visitante) { tVis.pontos += 3; tVis.vitorias++; tCasa.derrotas++; }
        }
      }
    })
    return tabela.sort((a, b) => b.pontos - a.pontos || b.saldo - a.saldo)
  }

  const calcularTops = () => {
    let s = {}
    jogadores.forEach(j => s[j.id] = { ...j, gols: 0, assistencias: 0, pim: 0 })
    todosEventos.forEach(ev => {
      if (ev.tipo === 'Gol' && s[ev.jogador_id]) {
        s[ev.jogador_id].gols++;
        if (ev.assistencia1_id && s[ev.assistencia1_id]) s[ev.assistencia1_id].assistencias++;
        if (ev.assistencia2_id && s[ev.assistencia2_id]) s[ev.assistencia2_id].assistencias++;
      }
      if (ev.tipo === 'Penalidade' && s[ev.jogador_id]) s[ev.jogador_id].pim += ev.minutos_penalidade || 0
    })
    const l = Object.values(s)
    return {
      artilheiros: l.sort((a,b) => b.gols - a.gols).slice(0,5),
      assistentes: l.sort((a,b) => b.assistencias - a.assistencias).slice(0,5),
      punidos: l.sort((a,b) => b.pim - a.pim).slice(0,5)
    }
  }

  // --- RENDERIZAÇÃO DA TELA DO PLACAR ---
  if (telaAtiva === 'placar') {
    const p = partidas.find(x => x.id === parseInt(partidaAtivaId))
    const penCasa = penalidadesAtivas.filter(x => x.time_id === p?.time_casa_id)
    const penVis = penalidadesAtivas.filter(x => x.time_id === p?.time_visitante_id)

    return (
      <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '20px' }}>
        <button onClick={() => setTelaAtiva('gestao')} style={{ position: 'absolute', top: 10, left: 10, opacity: 0.4, color: '#fff' }}>GESTÃO</button>
        <div style={{ textAlign: 'center', fontSize: '4rem', color: '#ffcc00' }}>{periodo}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '50px' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '3rem' }}>{getNomeTime(p?.time_casa_id).toUpperCase()}</div>
            <div style={{ fontSize: '15rem', color: '#e63946' }}>{golsCasaPlacar}</div>
            {penCasa.map(x => <div key={x.id} style={{ fontSize: '2.5rem', color: '#ffcc00' }}>#{x.numero} {formatarTempo(x.segundosRestantes)}</div>)}
            <div style={{marginTop: '20px'}}><button onClick={handleGolCasa} style={{ fontSize: '1.5rem', padding: '10px 20px' }}>+ GOL CASA</button></div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '12rem', color: '#00C9DB' }}>{formatarTempo(tempoSegundos)}</div>
            <button onClick={handleCronometro} style={{ fontSize: '2rem', padding: '10px 40px', backgroundColor: cronometroRodando ? '#e63946' : '#28a745', color: '#fff', border: 'none', borderRadius: '8px' }}>
              {cronometroRodando ? 'STOP' : 'START'}
            </button>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '3rem' }}>{getNomeTime(p?.time_visitante_id).toUpperCase()}</div>
            <div style={{ fontSize: '15rem' }}>{golsVisPlacar}</div>
            {penVis.map(x => <div key={x.id} style={{ fontSize: '2.5rem', color: '#ffcc00' }}>#{x.numero} {formatarTempo(x.segundosRestantes)}</div>)}
            <div style={{marginTop: '20px'}}><button onClick={handleGolVis} style={{ fontSize: '1.5rem', padding: '10px 20px' }}>+ GOL VISITANTE</button></div>
          </div>
        </div>
      </div>
    )
  }

  const ranking = calcularTops()
  const partidaSelecionada = partidas.find(p => p.id === parseInt(partidaAtivaId))
  const timeFiltroId = equipeAcao === 'casa' ? partidaSelecionada?.time_casa_id : partidaSelecionada?.time_visitante_id

  // --- RENDERIZAÇÃO DA TELA DE GESTÃO ---
  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#003366', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <h1 style={{ margin: 0 }}>🏒 Hockeytown Gestão</h1>
        <button onClick={() => setTelaAtiva('placar')} style={{ padding: '10px 20px', fontWeight: 'bold', backgroundColor: '#00C9DB', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>ABRIR TELÃO</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
          <h2 style={{ color: '#003366', borderBottom: '2px solid #00C9DB' }}>🏆 Classificação</h2>
          <table style={{ width: '100%', textAlign: 'center' }}>
            <thead><tr><th align="left">Time</th><th>Pts</th><th>J</th><th>SG</th></tr></thead>
            <tbody>{gerarTabela().map(t => <tr key={t.id}><td align="left"><strong>{t.nome}</strong></td><td>{t.pontos}</td><td>{t.jogos}</td><td>{t.saldo}</td></tr>)}</tbody>
          </table>
        </section>

        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
          <h2 style={{ color: '#003366', borderBottom: '2px solid #00C9DB' }}>📋 Súmula e Eventos</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select value={partidaAtivaId} onChange={e => setPartidaAtivaId(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <option value="">Selecione a Partida...</option>
              {partidas.map(p => <option key={p.id} value={p.id}>{getNomeTime(p.time_casa_id)} x {getNomeTime(p.time_visitante_id)} ({p.status})</option>)}
            </select>
            
            {partidaAtivaId && partidaSelecionada?.status !== 'Finalizado' && partidaSelecionada?.status !== 'Cancelado' && (
              <>
                <button onClick={() => alterarStatusPartida('Finalizado')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>FINALIZAR</button>
                <button onClick={() => alterarStatusPartida('Cancelado')} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
              </>
            )}
          </div>

          {partidaAtivaId && partidaSelecionada?.status === 'Em Andamento' && (
            <form onSubmit={registrarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fbfc', padding: '15px', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={periodo} onChange={e => setPeriodo(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}><option value="1ºP">1ºP</option><option value="2ºP">2ºP</option><option value="OT">OT</option></select>
                
                {/* Aqui está o bloco atualizado do cronômetro com o botão START/STOP */}
                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span>{formatarTempo(tempoSegundos)}</span>
                  <button type="button" onClick={handleCronometro} style={{ backgroundColor: cronometroRodando ? '#dc3545' : '#28a745', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {cronometroRodando ? 'STOP' : 'START'}
                  </button>
                </div>

                <select value={tipoEvento} onChange={e => setTipoEvento(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}><option value="Gol">Gol</option><option value="Penalidade">Penalidade</option></select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button type="button" onClick={() => setEquipeAcao('casa')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: equipeAcao === 'casa' ? '#003366' : '#e5e4e7', color: equipeAcao === 'casa' ? '#fff' : '#6b6375' }}>
                  Casa: {getNomeTime(partidaSelecionada?.time_casa_id)}
                </button>
                <button type="button" onClick={() => setEquipeAcao('visitante')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: equipeAcao === 'visitante' ? '#003366' : '#e5e4e7', color: equipeAcao === 'visitante' ? '#fff' : '#6b6375' }}>
                  Visitante: {getNomeTime(partidaSelecionada?.time_visitante_id)}
                </button>
              </div>

              <select required value={jogadorEventoId} onChange={e => setJogadorEventoId(e.target.value)} style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}}>
                <option value="">Jogador Principal...</option>
                {jogadores.filter(j => j.time_id === timeFiltroId).map(j => <option key={j.id} value={j.id}>#{j.numero_camisa} {j.nome}</option>)}
              </select>

              {tipoEvento === 'Gol' && (
                <div style={{display: 'flex', gap: '10px'}}>
                  <select value={assistencia1Id} onChange={e => setAssistencia1Id(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}>
                    <option value="">Assistência 1</option>
                    {jogadores.filter(j => j.time_id === timeFiltroId).map(j => <option key={j.id} value={j.id}>#{j.numero_camisa} {j.nome}</option>)}
                  </select>
                  <select value={assistencia2Id} onChange={e => setAssistencia2Id(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}>
                    <option value="">Assistência 2</option>
                    {jogadores.filter(j => j.time_id === timeFiltroId).map(j => <option key={j.id} value={j.id}>#{j.numero_camisa} {j.nome}</option>)}
                  </select>
                </div>
              )}
              {tipoEvento === 'Penalidade' && (
                <div style={{display: 'flex', gap: '10px'}}>
                  <input type="text" placeholder="Falta (ex: Tripping)" value={nomePenalidade} onChange={e => setNomePenalidade(e.target.value)} style={{flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}} />
                  <input type="number" placeholder="Min" value={minutosPenalidade} onChange={e => setMinutosPenalidade(e.target.value)} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}} />
                </div>
              )}
              <button type="submit" style={{ backgroundColor: '#00C9DB', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>REGISTRAR LANCE NO PLACAR</button>
            </form>
          )}
        </section>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#28a745', textAlign: 'center' }}>⚽ Artilheiros</h3>
          {ranking.artilheiros.filter(j => j.gols > 0).map(j => <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #eee' }}><span>{j.nome}</span><strong>{j.gols}</strong></div>)}
        </div>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#00C9DB', textAlign: 'center' }}>🤝 Assistências</h3>
          {ranking.assistentes.filter(j => j.assistencias > 0).map(j => <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #eee' }}><span>{j.nome}</span><strong>{j.assistencias}</strong></div>)}
        </div>
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#dc3545', textAlign: 'center' }}>⏱️ PIM (Minutos)</h3>
          {ranking.punidos.filter(j => j.pim > 0).map(j => <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #eee' }}><span>{j.nome}</span><strong>{j.pim}</strong></div>)}
        </div>
      </section>

      <footer style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
          <h3>+ Novo Time</h3>
          <form onSubmit={cadastrarTime} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nome do Time" value={nomeTime} onChange={e => setNomeTime(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} required />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Time</button>
          </form>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
          <h3>+ Novo Jogador</h3>
          <form onSubmit={cadastrarJogador} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nome do Atleta" value={nomeJogador} onChange={e => setNomeJogador(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Nº" value={numeroCamisa} onChange={e => setNumeroCamisa(e.target.value)} style={{ width: '80px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} required />
              <select value={timeSelecionado} onChange={e => setTimeSelecionado(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} required>
                <option value="">Time...</option>
                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Jogador</button>
          </form>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
          <h3>+ Nova Partida</h3>
          <form onSubmit={cadastrarPartida} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select value={timeCasa} onChange={e => setTimeCasa(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} required>
              <option value="">Time Mandante (Casa)...</option>
              {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <select value={timeVis} onChange={e => setTimeVis(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} required>
              <option value="">Time Visitante...</option>
              {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#00C9DB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Criar Partida</button>
          </form>
        </div>
      </footer>
    </div>
  )
}

export default App