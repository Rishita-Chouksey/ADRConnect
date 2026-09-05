from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from src.config.database import AsyncSessionLocal
from src.schemas.auth import LoginRequest, TokenResponse
from src.core.schemas.user import CurrentUser
from src.core.security import verify_password, create_access_token
from src.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT id, hospital_id, name, role, password_hash
        FROM users
        WHERE employee_id = :employee_id;
    """)
    result = await db.execute(query, {"employee_id": credentials.employee_id})
    user = result.mappings().first()

    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID or Password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {
        "sub": str(user["id"]),
        "role": user["role"],
        "hospital_id": str(user["hospital_id"])
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        user_id=user["id"],
        name=user["name"],
        role=user["role"],
        hospital_id=user["hospital_id"]
    )

@router.get("/me", response_model=CurrentUser)
async def get_my_profile(current_user: CurrentUser = Depends(get_current_user)):
    """Returns profile details for the currently authenticated user."""
    return current_user