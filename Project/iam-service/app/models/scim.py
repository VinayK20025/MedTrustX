"""
SCIM 2.0 Models.
"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, ConfigDict, Field

class SCIMName(BaseModel):
    model_config = ConfigDict(strict=True)
    familyName: Optional[str] = None
    givenName: Optional[str] = None

class SCIMEmail(BaseModel):
    model_config = ConfigDict(strict=True)
    value: str
    type: Optional[str] = None
    primary: Optional[bool] = None

class SCIMGroupRef(BaseModel):
    model_config = ConfigDict(strict=True)
    value: str
    display: Optional[str] = None

class SCIMUser(BaseModel):
    model_config = ConfigDict(strict=True)
    schemas: List[str] = ["urn:ietf:params:scim:schemas:core:2.0:User"]
    id: Optional[str] = None
    userName: str
    name: Optional[SCIMName] = None
    emails: Optional[List[SCIMEmail]] = None
    active: Optional[bool] = True
    groups: Optional[List[SCIMGroupRef]] = None

class SCIMListResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    schemas: List[str] = ["urn:ietf:params:scim:api:messages:2.0:ListResponse"]
    totalResults: int
    startIndex: int
    itemsPerPage: int
    Resources: List[Dict[str, Any]]
