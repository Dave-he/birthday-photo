import { Refine } from "@refinedev/core";
import { ThemedLayoutV2, ErrorComponent, RefineThemes, useNotificationProvider } from "@refinedev/antd";
import { dataProvider } from "@refinedev/supabase";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import routerBindings, { NavigateToResource, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router-v6";
import { ConfigProvider, App as AntdApp } from "antd";
import "@refinedev/antd/dist/reset.css";

import { supabaseClient } from "./utility/supabaseClient";
import { PhotoList } from "./pages/photos/list";
import { PhotoCreate } from "./pages/photos/create";
import { PhotoEdit } from "./pages/photos/edit";

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
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayoutV2>
                    <Outlet />
                  </ThemedLayoutV2>
                }
              >
                <Route index element={<NavigateToResource resource="photos" />} />
                <Route path="/photos">
                  <Route index element={<PhotoList />} />
                  <Route path="create" element={<PhotoCreate />} />
                  <Route path="edit/:id" element={<PhotoEdit />} />
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
