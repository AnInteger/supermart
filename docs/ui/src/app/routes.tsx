import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { SkillDetail } from "./pages/SkillDetail";
import { UploadSkill } from "./pages/UploadSkill";
import { Profile } from "./pages/Profile";
import { PublishNewVersion } from "./pages/PublishNewVersion";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "skill/:id", element: <SkillDetail /> },
      { path: "skill/:id/new-version", element: <PublishNewVersion /> },
      { path: "upload", element: <UploadSkill /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);