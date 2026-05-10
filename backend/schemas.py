class PartidaUpdateStatus(BaseModel):
    status: str
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
    periodo: str | None = None  
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
    periodo: str | None = None  
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