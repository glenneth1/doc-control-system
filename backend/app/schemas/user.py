from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: str | None = None


class UserInDBBase(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str
