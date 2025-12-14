import { eq } from "drizzle-orm";
import { getCredits } from "@/app/actions/credits/get";
import { profile } from "@/schema";
import { database } from "./database";
import { createClient } from "./supabase/server";

export const currentUser = async () => {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
};

export const currentUserProfile = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const userProfiles = await database
    .select()
    .from(profile)
    .where(eq(profile.id, user.id));
  let userProfile = userProfiles.at(0);

  if (!userProfile && user.email) {
    const response = await database
      .insert(profile)
      .values({ id: user.id })
      .returning();

    if (!response.length) {
      throw new Error("Failed to create user profile");
    }

    userProfile = response[0];
  }

  return userProfile;
};

export const getSubscribedUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Create an account to use AI features.");
  }

  const userProfile = await currentUserProfile();

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  if (!userProfile.subscriptionId) {
    throw new Error("Please upgrade to a paid plan to use AI features.");
  }

  const credits = await getCredits();

  if ("error" in credits) {
    throw new Error(credits.error);
  }

  return user;
};
