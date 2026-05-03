from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import recipes, meal_plans, shopping


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Chef Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["meal-plans"])
app.include_router(shopping.router, prefix="/api/shopping", tags=["shopping"])


@app.get("/health")
def health():
    return {"status": "ok"}
