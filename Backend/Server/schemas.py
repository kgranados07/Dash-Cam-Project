from pydantic import BaseModel
from typing import Optional

# Base properties
class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None

# Properties received on item creation
class ItemCreate(ItemBase):
    pass

# Properties returned to the client (includes generated DB keys)
class ItemResponse(ItemBase):
    id: int

    class Config:
        # Crucial for allowing Pydantic to read SQLAlchemy lazy-loaded data attributes
        from_attributes = True 
