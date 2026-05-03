from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Time(Base):
    __tablename__ = "times" # O nome exato da tabela que criamos no SQL

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    cidade = Column(String(100))
    logo_url = Column(String(255))
    criado_em = Column(DateTime, server_default=func.now())

class Jogador(Base):
    __tablename__ = "jogadores"

    id = Column(Integer, primary_key=True, index=True)
    time_id = Column(Integer, ForeignKey("times.id")) # Conecta com a tabela de times
    nome = Column(String(100), nullable=False)
    numero_camisa = Column(Integer)
    posicao = Column(String(2))
    criado_em = Column(DateTime, server_default=func.now())
    
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
    __tablename__ = "eventos_v2" # Criamos uma tabela nova para evitar conflitos no banco

    id = Column(Integer, primary_key=True, index=True)
    partida_id = Column(Integer, ForeignKey("partidas.id"))
    periodo = Column(String(10)) # Para anotar se foi no "1P", "2P", "OT"
    minuto = Column(Integer)
    segundo = Column(Integer)
    
    # Quem fez a ação principal (o gol ou a falta)
    jogador_id = Column(Integer, ForeignKey("jogadores.id"))
    tipo = Column(String(50), nullable=False) # Ex: "Gol", "Penalidade"

    # --- Campos extras para GOLS ---
    assistencia1_id = Column(Integer, ForeignKey("jogadores.id"), nullable=True)
    assistencia2_id = Column(Integer, ForeignKey("jogadores.id"), nullable=True)

    # --- Campos extras para PENALIDADES ---
    nome_penalidade = Column(String(100), nullable=True) # Ex: "Tripping", "Roughing"
    minutos_penalidade = Column(Integer, nullable=True) # Quantos minutos fora?

    criado_em = Column(DateTime, server_default=func.now())