import { DefaultSession } from "next-auth";
import { UserRole, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: UserRole;
      status?: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string;
    role?: UserRole;
    status?: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: UserRole;
    status?: UserStatus;
  }
}
