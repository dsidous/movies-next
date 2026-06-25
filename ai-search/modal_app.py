import modal

image = modal.Image.debian_slim(python_version="3.12").pip_install_from_requirements(
    "requirements.txt"
)

app = modal.App("movies-ai-search", image=image)


@app.function(
    secrets=[modal.Secret.from_name("ai-search-secrets")],
    timeout=60,
)
@modal.asgi_app()
def web():
    from main import app as fastapi_app

    return fastapi_app
