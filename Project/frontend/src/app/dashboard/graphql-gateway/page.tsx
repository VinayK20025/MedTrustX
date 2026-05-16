import { GraphQLGatewayDashboard } from '@/modules/graphql-gateway/pages/GraphQLGatewayDashboard';

export default function GraphQLGatewayPage() {
  return <GraphQLGatewayDashboard />;
}

export const metadata = {
  title: 'GraphQL Federation Gateway | MedTrustX',
  description: 'Unified GraphQL federation layer for all MedTrustX microservices',
};
