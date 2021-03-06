interface UserType {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  role: string;
  birthDay: string;
  cpf: string;
  lockRequestsTimestamp?: string;
  lockRequests?: boolean;
  picture?: string;
}

interface UserToCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  birthDay: string;
  cpf: string;
}

interface UserToUpdate {
  uuid: string;
  name: string;
  email: string;
  password: string;
  newPassword?: string;
  role: string;
  birthDay: string;
  cpf: string;
}

interface UserSearchParams {
  name?: string;
  email?: string;
  cpf?: string;
  role?: string;
  birthDay?: string;
  page?: number;
  size?: number;
  lockRequests?: number;
  sort?: string;
}

interface UserPaginatedType {
  totalElements: number;
  content: UserType[];
}

interface UserSearchForm {
  name: string;
  email: string;
  cpf: string;
  role: string[];
  birthDay: any;
  lockRequests: number;
  sort: SortType;
}

interface TotalUsers {
  total: number;
  locked: number;
  unlocked: number;
}
