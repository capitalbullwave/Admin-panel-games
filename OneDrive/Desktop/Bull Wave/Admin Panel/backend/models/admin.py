from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from db.base_class import Base

class Admin(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    hashed_password = Column("password_hash", String, nullable=False)
    role = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    totp_secret = Column(String, nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
