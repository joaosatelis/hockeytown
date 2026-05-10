from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import List
import schemas
import models
from database import engine, SessionLocal, Base

# Cria as tabelas no banco de dados
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Libera a comunicação entre o React (porta 5173) e o FastAPI (porta 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Dependência para gerenciar a sessão com o banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# WEBSOCKET MANAGER (Tempo Real)
# ==========================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# ==========================================
# ROTAS DA API
# ==========================================

# --- TIMES ---
@app.post("/times", response_model=schemas.TimeResponse)
def criar_time(time: schemas.TimeCreate, db: Session = Depends(get_db)):
    novo_time = models.Time(nome=time.nome, cidade=time.cidade, logo_url=time.logo_url)
    db.add(novo_time)
    db.commit()
    db.refresh(novo_time)
    return novo_time

@app.get("/times", response_model=List[schemas.TimeResponse])
def listar_times(db: Session = Depends(get_db)):
    times = db.query(models.Time).all()
    return times

# --- JOGADORES ---
@app.post("/jogadores", response_model=schemas.JogadorResponse)
def criar_jogador(jogador: schemas.JogadorCreate, db: Session = Depends(get_db)):
    novo_jogador = models.Jogador(
        nome=jogador.nome, 
        numero_camisa=jogador.numero_camisa, 
        posicao=jogador.posicao,
        time_id=jogador.time_id
    )
    db.add(novo_jogador)
    db.commit()
    db.refresh(novo_jogador)
    return novo_jogador

@app.get("/jogadores", response_model=List[schemas.JogadorResponse])
def listar_jogadores(db: Session = Depends(get_db)):
    jogadores = db.query(models.Jogador).all()
    return jogadores

# --- PARTIDAS ---
@app.put("/partidas/{partida_id}/status", response_model=schemas.PartidaResponse)
def atualizar_status_partida(partida_id: int, status_update: schemas.PartidaUpdateStatus, db: Session = Depends(get_db)):
    partida = db.query(models.Partida).filter(models.Partida.id == partida_id).first()
    if not partida:
        raise HTTPException(status_code=404, detail="Partida não encontrada")
    
    partida.status = status_update.status
    db.commit()
    db.refresh(partida)
    return partida

@app.post("/partidas", response_model=schemas.PartidaResponse)
def criar_partida(partida: schemas.PartidaCreate, db: Session = Depends(get_db)):
    nova_partida = models.Partida(
        time_casa_id=partida.time_casa_id,
        time_visitante_id=partida.time_visitante_id,
        placar_casa=partida.placar_casa,
        placar_visitante=partida.placar_visitante,
        status=partida.status
    )
    db.add(nova_partida)
    db.commit()
    db.refresh(nova_partida)
    return nova_partida

@app.get("/partidas", response_model=List[schemas.PartidaResponse])
def listar_partidas(db: Session = Depends(get_db)):
    partidas = db.query(models.Partida).all()
    return partidas

# --- EVENTOS DA SÚMULA ---
@app.post("/eventos", response_model=schemas.EventoResponse)
def registrar_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    novo_evento = models.Evento(
        partida_id=evento.partida_id,
        periodo=evento.periodo,
        minuto=evento.minuto,
        segundo=evento.segundo,
        jogador_id=evento.jogador_id,
        tipo=evento.tipo,
        assistencia1_id=evento.assistencia1_id,
        assistencia2_id=evento.assistencia2_id,
        nome_penalidade=evento.nome_penalidade,
        minutos_penalidade=evento.minutos_penalidade
    )
    db.add(novo_evento)
    db.commit()
    db.refresh(novo_evento)
    return novo_evento

@app.get("/eventos/partida/{partida_id}", response_model=List[schemas.EventoResponse])
def listar_eventos_da_partida(partida_id: int, db: Session = Depends(get_db)):
    return db.query(models.Evento).filter(models.Evento.partida_id == partida_id).all()

@app.get("/eventos", response_model=List[schemas.EventoResponse])
def listar_todos_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()

# --- WEBSOCKET ROTA ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Escuta dados recebidos do front e repassa para todo mundo conectado
            data = await websocket.receive_json()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)