export interface LoginAsCashierFormData {
  name: string;
  accessKey: string;
}

export interface LoginAsCashierPayload {
  access_token: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  permission: string;
}
