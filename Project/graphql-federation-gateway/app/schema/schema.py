"""
Combined GraphQL Schema.
"""
import strawberry
from app.schema.query import Query
from app.schema.mutation import Mutation

schema = strawberry.Schema(query=Query, mutation=Mutation)
