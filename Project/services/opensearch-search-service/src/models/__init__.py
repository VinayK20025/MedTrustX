"""MedTrustX OpenSearch Search Service — Models."""
from src.models.base import BaseModel
from src.models.opensearch import SearchIndex, IndexedDocument, SearchQuery

__all__ = ["BaseModel", "SearchIndex", "IndexedDocument", "SearchQuery"]
