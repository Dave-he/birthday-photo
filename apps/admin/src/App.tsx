import { GitHubBanner, Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { useNotificationProvider, ThemedLayout, ErrorComponent, AuthPage } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
  CatchAllNavigate,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import authProvider from "./authProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { supabaseClient } from "./utility";
import { Header } from "./components/header";

// Import resource pages
import { DashboardPage } from "./pages/dashboard";
import { PhotoList, PhotoCreate, PhotoEdit } from "./pages/photos";
import { SceneList, SceneCreate, SceneEdit } from "./pages/scenes";
import { MemberList, MemberCreate, MemberEdit } from "./pages/members";
import { SettingsEdit } from "./pages/settings";

// Import icons
import {
  DashboardOutlined,
  PictureOutlined,
  TeamOutlined,
  FolderOutlined,
  SettingOutlined,
} from "@ant-design/icons";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(supabaseClient)}
                liveProvider={liveProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerProvider}
                notificationProvider={useNotificationProvider}
                resources={[
                  {
                    name: "dashboard",
                    list: "/",
                    meta: {
                      label: "Dashboard",
                      icon: <DashboardOutlined />,
                    },
                  },
                  {
                    name: "photos",
                    list: "/photos",
                    create: "/photos/create",
                    edit: "/photos/edit/:id",
                    meta: {
                      label: "Photos",
                      icon: <PictureOutlined />,
                    },
                  },
                  {
                    name: "scenes",
                    list: "/scenes",
                    create: "/scenes/create",
                    edit: "/scenes/edit/:id",
                    meta: {
                      label: "Scenes",
                      icon: <FolderOutlined />,
                    },
                  },
                  {
                    name: "members",
                    list: "/members",
                    create: "/members/create",
                    edit: "/members/edit/:id",
                    meta: {
                      label: "Members",
                      icon: <TeamOutlined />,
                    },
                  },
                  {
                    name: "settings",
                    list: "/settings",
                    edit: "/settings/edit/:id",
                    meta: {
                      label: "Settings",
                      icon: <SettingOutlined />,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "BtkgAT-WSKsVM-8z3w24",
                  liveMode: "auto",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-routes"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout Header={Header}>
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
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
                      <Route index element={<SettingsEdit />} />
                      <Route path="edit/:id" element={<SettingsEdit />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated key="auth-pages" fallback={<Outlet />}>
                        <CatchAllNavigate to="/" />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={
                        <AuthPage
                          type="login"
                          formProps={{
                            initialValues: {
                              email: "admin@hamr.top",
                              password: "admin",
                            },
                          }}
                        />
                      }
                    />
                    <Route
                      path="/register"
                      element={<AuthPage type="register" />}
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" />}
                    />
                    <Route
                      path="/update-password"
                      element={<AuthPage type="updatePassword" />}
                    />
                  </Route>
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
