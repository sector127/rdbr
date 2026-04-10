import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      token?: string;
      access_token?: string;
      data?: {
        token?: string;
        user?: {
          id?: number;
          username?: string;
          email?: string;
          avatar?: string | null;
          fullName?: string | null;
          mobileNumber?: string | null;
          age?: number | null;
          profileComplete?: boolean;
        };
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: any;
  }
}
