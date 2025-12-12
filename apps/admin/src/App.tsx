import { Refine } from "@refinedev/core";
import { ThemedLayout, ErrorComponent, RefineThemes, useNotificationProvider } from "@refinedev/antd";
import { dataProvider } from "@refinedev/supabase";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import routerBindings, { UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router-v6";
import { ConfigProvider, App as AntdApp } from "antd";
import "@refinedev/antd/dist/reset.css";

import { supabaseClient } from "./utility/supabaseClient";
import { DashboardPage } from "./pages/dashboard";
import { PhotoList } from "./pages/photos/list";
import { PhotoCreate } from "./pages/photos/create";
import { PhotoEdit } from "./pages/photos/edit";
import { SettingsEdit } from "./pages/settings/edit";
import { SettingsIndex } from "./pages/settings/index";

import { SceneList } from "./pages/scenes/list";
import { SceneCreate } from "./pages/scenes/create";
import { SceneEdit } from "./pages/scenes/edit";
import { MemberList } from "./pages/members/list";
import { MemberCreate } from "./pages/members/create";
import { MemberEdit } from "./pages/members/edit";

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "photos",
                list: "/photos",
                create: "/photos/create",
                edit: "/photos/edit/:id",
                meta: {
                  label: "Photos",
                },
              },
              {
                name: "scenes",
                list: "/scenes",
                create: "/scenes/create",
                edit: "/scenes/edit/:id",
                meta: {
                  label: "Scenes",
                },
              },
              {
                name: "members",
                list: "/members",
                create: "/members/create",
                edit: "/members/edit/:id",
                meta: {
                  label: "Members (Users)",
                },
              },
              {
                name: "settings",
                list: "/settings",
                edit: "/settings/edit/:id",
                meta: {
                  label: "Global Settings",
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayout>
                    <Outlet />
                  </ThemedLayout>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="/photos">
                  <Route index element={<PhotoList />} />
                  <Route path="create" element={<PhotoCreate />} />
                  <Route path="edit/:id" element={<PhotoEdit />} />
                </Route>
                <Route path="/scenes">
                  <Route index element={<SceneList />} />
                  <Route path="create" element={<SceneCreate />} />
                  <Route path="edit/:id" element={<SceneEdit />} />
                </Route>
                <Route path="/members">
                  <Route index element={<MemberList />} />
                  <Route path="create" element={<MemberCreate />} />
                  <Route path="edit/:id" element={<MemberEdit />} />
                </Route>
                <Route path="/settings">
                     <Route index element={<SettingsIndex />} /> 
                     <Route path="edit/:id" element={<SettingsEdit />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
