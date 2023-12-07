import React, { Suspense, useEffect } from "react";

import {
  Authenticated,
  CanAccess,
  CanParams,
  CanReturnType,
  GitHubBanner,
  Refine,
} from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  notificationProvider,
  ThemedLayoutV2,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { ExtendedWindow } from "./types";
import { newEnforcer } from "casbin";
import { adapter, model } from "./accessControl";
import { Sider } from "components";

const BlogPostList = React.lazy(() => import("blog_posts/BlogPostList"));
const BlogPostShow = React.lazy(() => import("blog_posts/BlogPostShow"));
const BlogPostEdit = React.lazy(() => import("blog_posts/BlogPostEdit"));
const BlogPostCreate = React.lazy(() => import("blog_posts/BlogPostCreate"));

const CategoryList = React.lazy(() => import("categories/CategoryList"));
const CategoryShow = React.lazy(() => import("categories/CategoryShow"));
const CategoryEdit = React.lazy(() => import("categories/CategoryEdit"));
const CategoryCreate = React.lazy(() => import("categories/CategoryCreate"));

declare let window: ExtendedWindow;

function App() {
  useEffect(() => {
    // This is not as elegant as production code as we cannot use such in production.
    // But lets assume these envs are coming from a environment handler.
    // And this is only for sample case.
    if (import.meta.env.VITE_CATEGORIES_URL) {
      // This is where we set the payment remote's URL.
      window.categoriesUrl = import.meta.env.VITE_CATEGORIES_URL;
    }
  }, []);
  const role = "admin";

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <Refine
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            notificationProvider={notificationProvider}
            routerProvider={routerBindings}
            authProvider={authProvider}
            accessControlProvider={{
              can: async ({ action, params, resource }) => {
                const enforcer = await newEnforcer(model, adapter);
                if (
                  action === "delete" ||
                  action === "edit" ||
                  action === "show"
                ) {
                  return Promise.resolve({
                    can: await enforcer.enforce(
                      role,
                      `${resource}/${params?.id}`,
                      action
                    ),
                  });
                }
                if (action === "field") {
                  return Promise.resolve({
                    can: await enforcer.enforce(
                      role,
                      `${resource}/${params?.field}`,
                      action
                    ),
                  });
                }
                return {
                  can: await enforcer.enforce(role, resource, action),
                };
              },
            }}
            resources={[
              {
                name: "blog_posts",
                list: "/blog-posts",
                create: "/blog-posts/create",
                edit: "/blog-posts/edit/:id",
                show: "/blog-posts/show/:id",
                meta: {
                  canDelete: true,
                },
              },
              {
                name: "categories",
                list: "/categories",
                create: "/categories/create",
                edit: "/categories/edit/:id",
                show: "/categories/show/:id",
                meta: {
                  canDelete: true,
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
                  <Authenticated
                    key="authenticated-routes"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2 Header={Header} Sider={Sider}>
                      <CanAccess>
                        <Outlet />
                      </CanAccess>
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource />} />
                <Route path="/blog-posts">
                  <Route
                    index
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <BlogPostList />
                      </Suspense>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <BlogPostCreate />
                      </Suspense>
                    }
                  />
                  <Route
                    path="edit/:id"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <BlogPostEdit />
                      </Suspense>
                    }
                  />
                  <Route
                    path="show/:id"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <BlogPostShow />
                      </Suspense>
                    }
                  />
                </Route>
                <Route path="/categories">
                  <Route
                    index
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <CategoryList />
                      </Suspense>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <CategoryCreate />
                      </Suspense>
                    }
                  />
                  <Route
                    path="edit/:id"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <CategoryEdit />
                      </Suspense>
                    }
                  />
                  <Route
                    path="show/:id"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <CategoryShow />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayoutV2 Header={Header}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <RefineKbar />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
