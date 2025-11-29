export type Course = {
  id: string;
  title: string;
  code: string;
  role: string;
  enrolled: string;
  completed: string;
  isActive?: boolean; // ✅ optional to support both use cases
};
