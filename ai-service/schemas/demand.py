from pydantic import BaseModel

class DemandRequest(BaseModel):
    location: str
    hour: int
    day_of_week: str
    weather: str