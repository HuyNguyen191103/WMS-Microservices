const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type LoginPayload = {
  mail: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  expired: number;
};

export type UserProfile = {
  profile_id: string;
  phone_number: string;
  address: string;
  department: string;
} | null;

export type UserRole = {
  role_id: string;
  role_name: string;
  description: string;
};

export type UserInfo = {
  user_id: string;
  username: string;
  mail: string;
  status: string;
  profile: UserProfile;
  roles: UserRole[];
};

export type GetMeResponse = {
  user: UserInfo | null;
};

async function parseApiError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function login(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid email or password.");
    }

    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as LoginResponse;
}

export async function getMe(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as GetMeResponse;
}
