import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.base_class import Base 

class Shop(Base):
    __tablename__ = "shops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String(10), unique=True, nullable=False, index=True)
    subdomain = Column(String, unique=True, index=True, nullable=True)
    logo_url = Column(String, nullable=True)
    theme_color = Column(String, default="#2563EB")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    line_channel_token = Column(String, nullable=True)
    line_target_id = Column(String, nullable=True)
    line_id = Column(String, nullable=True)
    login_config = Column(JSONB, default={
        "background_url": "",
        "background_overlay": 0.3,
        "box_position": {"x": 50, "y": 50}, 
        "box_style": {
            "is_glassmorphism": True,
            "width": 40,
            "height": 50,
            "border_radius": 24,
            "border_width": 2,
            "border_color": "#ffd700",
            "shadow_x": 0,
            "shadow_y": 20,
            "shadow_blur": 50,
            "shadow_color": "#00000080",
            "box_bg_opacity": 0.1,
            "box_bg_blur": 20,
            "box_background_url": ""
        },
        "logo_size": 120,
        "font_family": "Kanit"
    })
    
    # Relationship: เชื่อมไปหา User (ใช้ string "User" เพื่อเลี่ยง circular import)
    users = relationship("User", back_populates="shop", cascade="all, delete-orphan")
    