from fastapi import APIRouter, status

from app.api.deps import CurrentContextDep
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, UserResponse
from app.services.auth_service import login_user, refresh_user_token, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> AuthResponse:
    return register_user(
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
        tenant_name=payload.tenant_name,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    return login_user(email=payload.email, password=payload.password)


@router.post("/refresh", response_model=dict)
def refresh(payload: RefreshRequest) -> dict:
    tokens = refresh_user_token(payload.refresh_token)
    return {"tokens": tokens.model_dump()}


@router.get("/me", response_model=UserResponse)
def me(context: CurrentContextDep) -> UserResponse:
    return UserResponse(
        id=context.user.id,
        full_name=context.user.full_name,
        email=context.user.email,
        memberships=[
            {"tenant_id": context.membership.tenant_id, "role": context.membership.role}
        ],
    )
