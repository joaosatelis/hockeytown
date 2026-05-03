from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import List
from pydantic import BaseModel
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
# SCHEMAS (Validações de entrada e saída)
# ==========================================

class TimeCreate(BaseModel):
    nome: str
    cidade: str | None = None
    logo_url: str | None = None

class TimeResponse(BaseModel):
    id: int
    nome: str
    cidade: str | None = None
    logo_url: str | None = None

    class Config:
        from_attributes = True

class JogadorCreate(BaseModel):
    nome: str
    numero_camisa: int
    posicao: str
    time_id: int

class JogadorResponse(BaseModel):
    id: int
    nome: str
    numero_camisa: int
    posicao: str
    time_id: int

    class Config:
        from_attributes = True

class PartidaCreate(BaseModel):
    time_casa_id: int
    time_visitante_id: int
    placar_casa: int
    placar_visitante: int
    status: str = "Finalizado"

class PartidaResponse(BaseModel):
    id: int
    time_casa_id: int
    time_visitante_id: int
    placar_casa: int
    placar_visitante: int
    status: str

    class Config:
        from_attributes = True

class EventoCreate(BaseModel):
    partida_id: int
    periodo: str | None = None  # Correção: Agora aceita vazio sem travar
    minuto: int = 0
    segundo: int = 0
    jogador_id: int
    tipo: str
    assistencia1_id: int | None = None
    assistencia2_id: int | None = None
    nome_penalidade: str | None = None
    minutos_penalidade: int | None = None

class EventoResponse(BaseModel):
    id: int
    partida_id: int
    periodo: str | None = None  # Correção: Agora aceita vazio sem travar
    minuto: int
    segundo: int
    jogador_id: int
    tipo: str
    assistencia1_id: int | None = None
    assistencia2_id: int | None = None
    nome_penalidade: str | None = None
    minutos_penalidade: int | None = None

    class Config:
        from_attributes = True

# ==========================================
# ROTAS DA API
# ==========================================

# --- TIMES ---
@app.post("/times", response_model=TimeResponse)
def criar_time(time: TimeCreate, db: Session = Depends(get_db)):
    novo_time = models.Time(nome=time.nome, cidade=time.cidade, logo_url=time.logo_url)
    db.add(novo_time)
    db.commit()
    db.refresh(novo_time)
    return novo_time

@app.get("/times", response_model=List[TimeResponse])
def listar_times(db: Session = Depends(get_db)):
    times = db.query(models.Time).all()
    return times

# --- JOGADORES ---
@app.post("/jogadores", response_model=JogadorResponse)
def criar_jogador(jogador: JogadorCreate, db: Session = Depends(get_db)):
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

@app.get("/jogadores", response_model=List[JogadorResponse])
def listar_jogadores(db: Session = Depends(get_db)):
    jogadores = db.query(models.Jogador).all()
    return jogadores

# --- PARTIDAS ---
@app.post("/partidas", response_model=PartidaResponse)
def criar_partida(partida: PartidaCreate, db: Session = Depends(get_db)):
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

@app.get("/partidas", response_model=List[PartidaResponse])
def listar_partidas(db: Session = Depends(get_db)):
    partidas = db.query(models.Partida).all()
    return partidas

# --- EVENTOS DA SÚMULA ---
@app.post("/eventos", response_model=EventoResponse)
def registrar_evento(evento: EventoCreate, db: Session = Depends(get_db)):
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

@app.get("/eventos/partida/{partida_id}", response_model=List[EventoResponse])
def listar_eventos_da_partida(partida_id: int, db: Session = Depends(get_db)):
    return db.query(models.Evento).filter(models.Evento.partida_id == partida_id).all()

# Nova rota para puxar todos os eventos e alimentar as estatísticas do campeonato
@app.get("/eventos", response_model=List[EventoResponse])
def listar_todos_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()