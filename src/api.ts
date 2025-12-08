/* ---------- ADMIN: FETCH USERS FOR ENROLL DRAWER ---------- */

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
};

export async function adminSearchUsers(query: string): Promise<AdminUser[]> {
  const res = await client.get("/admin/users", {
    params: { search: query }
  });
  return res.data as AdminUser[];
}
