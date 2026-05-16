"""
GraphQL Router.
"""
from strawberry.fastapi import GraphQLRouter
from app.schema.schema import schema
from app.auth.middleware import get_context

graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context
)
