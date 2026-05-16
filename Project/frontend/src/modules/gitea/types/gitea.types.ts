export interface Repository {
  id: string;
  name: string;
  owner_id: string;
  is_private: boolean;
}

export interface Commit {
  id: string;
  repo_id: string;
  commit_hash: string;
  author_id: string;
  message: string;
}

export interface PullRequest {
  id: string;
  repo_id: string;
  source_branch: string;
  target_branch: string;
  status: string;
}

export interface Issue {
  id: string;
  repo_id: string;
  title: string;
  description: string | null;
  status: string;
}
