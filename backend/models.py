from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Time(Base):
    __tablename__ = "times"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    cidade = Column(String(100))
    logo_url = Column(String(255))
    criado_em = Column(DateTime, server_default=func.now())

class Jogador(Base):
    __tablename__ = "jogadores"
    id = Column(Integer, primary_key=True, index=True)
    time_id = Column(Integer, ForeignKey("times.id"))
    nome = Column(String(100), nullable=False)
    numero_camisa = Column(Integer)
    posicao = Column(String(2)) # GK, DF, FW
    criado_em = Column(DateTime, server_default=func.now())

# --- NOVAS TABELAS PARA STAFF E ARBITRAGEM ---

class Treinador(Base):
    __tablename__ = "treinadores"
    id = Column(Integer, primary_key=True, index=True)
    time_id = Column(Integer, ForeignKey("times.id"))
    nome = Column(String(100), nullable=False)
    cargo = Column(String(50)) # Ex: Head Coach, Assistant Coach
    criado_em = Column(DateTime, server_default=func.now())

class Arbitro(Base):
    __tablename__ = "arbitros"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    funcao = Column(String(50)) # Ex: Referee, Linesman
    criado_em = Column(DateTime, server_default=func.now())

class Mesario(Base):
    __tablename__ = "mesarios"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    funcao = Column(String(50)) # Ex: Scorekeeper, Timekeeper
    criado_em = Column(DateTime, server_default=func.now())

# --- ESTRUTURA DA PARTIDA ---

class Partida(Base):
    __tablename__ = "partidas"
    id = Column(Integer, primary_key=True, index=True)
    time_casa_id = Column(Integer, ForeignKey("times.id"))
    time_visitante_id = Column(Integer, ForeignKey("times.id"))
    placar_casa = Column(Integer, default=0)
    placar_visitante = Column(Integer, default=0)
    status = Column(String(20), default="Finalizado") 
    data_hora = Column(DateTime, server_default=func.now())

class Evento(Base):
    __tablename__ = "eventos_v2"
    id = Column(Integer, primary_key=True, index=True)
    partida_id = Column(Integer, ForeignKey("partidas.id"))
    periodo = Column(String(10)) 
    minuto = Column(Integer)
    segundo = Column(Integer)
    jogador_id = Column(Integer, ForeignKey("jogadores.id"))
    tipo = Column(String(50), nullable=False) # Gol, Penalidade, Chute
    
    # Campos para GOLS
    assistencia1_id = Column(Integer, ForeignKey("jogadores.id"), nullable=True)
    assistencia2_id = Column(Integer, ForeignKey("jogadores.id"), nullable=True)

    # Campos para PENALIDADES
    nome_penalidade = Column(String(100), nullable=True)
    minutos_penalidade = Column(Integer, nullable=True)

    criado_em = Column(DateTime, server_default=func.now())