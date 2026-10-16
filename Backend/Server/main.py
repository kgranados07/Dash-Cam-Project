from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

for i in range(10):
    @app.get(f"/{i}")
    def test():
        return i