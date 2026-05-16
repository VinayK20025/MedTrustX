"""
GraphQL Mutations.
"""
import strawberry

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def ping(self) -> str:
        return "pong"
