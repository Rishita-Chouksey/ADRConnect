from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from src.config.database import AsyncSessionLocal
from src.core.security import SECRET_KEY, ALGORITHM
from src.core.schemas.user import CurrentUser, TokenData

from fastapi import Depends, HTTPException, status
from typing import List
from src.core.schemas.user import CurrentUser

security = HTTPBearer()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> CurrentUser:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        role: str = payload.get("role")
        hospital_id_str: str = payload.get("hospital_id")
        
        if user_id_str is None or role is None or hospital_id_str is None:
            raise credentials_exception
            
        token_data = TokenData(
            user_id=UUID(user_id_str),
            role=role,
            hospital_id=UUID(hospital_id_str)
        )
    except Exception:
        raise credentials_exception

    query = text("""
        SELECT id, hospital_id, name, role, employee_id, ward, occupation
        FROM users
        WHERE id = :user_id AND is_active = TRUE;
    """)
    result = await db.execute(query, {"user_id": token_data.user_id})
    user = result.mappings().first()

    if user is None:
        raise credentials_exception

    return CurrentUser(
        id=user["id"],
        hospital_id=user["hospital_id"],
        name=user["name"],
        role=user["role"],
        employee_id=user["employee_id"],
        ward=user["ward"],
        occupation=user["occupation"]
    )

def require_roles(allowed_roles: List[str]):
    """Enforces role-based endpoint access control."""
    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed role(s): {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker
