import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createProjectAction } from "@/app/actions/project/create";
import { currentUser, currentUserProfile } from "@/lib/auth";
import { database } from "@/lib/database";
import { projects } from "@/schema";

export const metadata: Metadata = {
  title: "Tersa",
  description: "Create and share AI workflows",
};

export const maxDuration = 800; // 13 minutes

const Projects = async () => {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const profile = await currentUserProfile();

  if (!profile?.onboardedAt) {
    return redirect("/welcome");
  }

  let project = await database.query.projects.findFirst({
    where: eq(projects.userId, profile.id),
  });

  if (!project) {
    const newProject = await createProjectAction("Untitled Project");

    if ("error" in newProject) {
      throw new Error(newProject.error);
    }

    const newFetchedProject = await database.query.projects.findFirst({
      where: eq(projects.id, newProject.id),
    });

    if (!newFetchedProject) {
      throw new Error("Failed to create project");
    }

    project = newFetchedProject;
  }

  redirect(`/projects/${project.id}`);
};

export default Projects;
