import { revalidateTag, revalidatePath } from "next/cache";

export interface RevalidatePortfolioOptions {
  userId?: string;
  username?: string | null;
  domain?: string | null;
}

/**
 * Revalidates public portfolio cache entries when a user updates their profile, projects, skills,
 * experience, education, portfolio settings, template, customization, or publishing status.
 */
export function revalidatePortfolioCache(options: RevalidatePortfolioOptions) {
  try {
    if (options.username) {
      const cleanUsername = options.username.toLowerCase().trim();
      revalidateTag(`portfolio:username:${cleanUsername}`, { expire: 0 });
      revalidatePath(`/${cleanUsername}`);
    }
    if (options.userId) {
      revalidateTag(`portfolio:user:${options.userId}`, { expire: 0 });
    }
    if (options.domain) {
      const cleanDomain = options.domain.toLowerCase().trim();
      revalidateTag(`portfolio:domain:${cleanDomain}`, { expire: 0 });
      revalidatePath(`/${cleanDomain}`);
      if (cleanDomain.startsWith("www.")) {
        const root = cleanDomain.replace(/^www\./, "");
        revalidateTag(`portfolio:domain:${root}`, { expire: 0 });
        revalidatePath(`/${root}`);
      }
    }
    revalidateTag("portfolio:all", { expire: 0 });
  } catch (error) {
    console.error("revalidatePortfolioCache error:", error);
  }
}
