from pydantic import BaseModel, Field


class InterpretRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)


class InterpretResponse(BaseModel):
    search_terms: list[str]
