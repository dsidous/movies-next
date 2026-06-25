from fastapi import Depends, FastAPI, Header, HTTPException, status

from config import Settings, get_settings
from providers import interpret_query
from schemas import InterpretRequest, InterpretResponse

app = FastAPI(title="AI Search", version="1.0.0")


def verify_service_key(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    expected = settings.ai_search_service_key
    if not expected:
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    token = authorization.removeprefix("Bearer ").strip()
    if token != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/interpret", response_model=InterpretResponse)
def interpret(
    body: InterpretRequest,
    _: None = Depends(verify_service_key),
    settings: Settings = Depends(get_settings),
) -> InterpretResponse:
    try:
        search_terms = interpret_query(body.query, settings)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider request failed",
        ) from e

    return InterpretResponse(search_terms=search_terms)
