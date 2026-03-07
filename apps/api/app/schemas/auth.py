from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.domain.models import Role


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    tenant_name: str = Field(min_length=3, max_length=120)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MembershipResponse(BaseModel):
    tenant_id: str
    role: Role


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    memberships: list[MembershipResponse]


class AuthResponse(BaseModel):
    tokens: AuthTokens
    user: UserResponse
