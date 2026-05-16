// Services
export * from './services/iam.api';
export * from './types/iam.types';

// Components
export { IamUserPanel } from './components/IamUserPanel';
export { IamRolePanel } from './components/IamRolePanel';
export { IamPolicyPanel } from './components/IamPolicyPanel';
export { IamAuthPanel } from './components/IamAuthPanel';
export { IamRequestPanel } from './components/IamRequestPanel';
export { IamReviewPanel } from './components/IamReviewPanel';
export { IamAuditPanel } from './components/IamAuditPanel';

// Pages
export { IamDashboard } from './pages/IamDashboard';
export { IamUsersPage } from './pages/IamUsersPage';
export { IamRolesPage } from './pages/IamRolesPage';
export { IamPoliciesPage } from './pages/IamPoliciesPage';
export { IamRequestsPage } from './pages/IamRequestsPage';
export { IamReviewsPage } from './pages/IamReviewsPage';
export { IamAuditPage } from './pages/IamAuditPage';
export { IamAuthPage } from './pages/IamAuthPage';

// Hooks
export {
  useIamDashboard,
  useApproveRequest,
  useRejectRequest,
  useEnforceMfa,
  useLockUser,
  useReviewIdentities,
  useCertifyIdentity,
  useToggleAuthMethod,
  useTogglePolicy,
  useDeletePolicy,
} from './hooks/useIamAnalytics';

// Types
export type * from './types/iam.types';
