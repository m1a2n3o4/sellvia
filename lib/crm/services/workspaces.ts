// Service boundary for the CRM. UI code imports only from here, never from ../mock.
// When the backend is ready, swap these implementations for real data access.
import { MOCK_USER, MOCK_WORKSPACES } from '../mock/workspaces';
import type { CrmUser, Workspace } from '../types';

export const IS_SIMULATED = true;

export async function listWorkspaces(): Promise<Workspace[]> {
  return MOCK_WORKSPACES;
}

export async function getCurrentUser(): Promise<CrmUser> {
  return MOCK_USER;
}
