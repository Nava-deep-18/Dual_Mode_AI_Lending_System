from fastapi import FastAPI

app = FastAPI(title="Dual-Mode Loan Risk API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Dual-Mode Loan Risk API"}
