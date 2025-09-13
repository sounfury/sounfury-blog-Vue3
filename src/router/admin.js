export const adminRoutes = [
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/views/admin/index.vue"),
    redirect: "/admin/dashboard",
    meta: {
      title: "管理中心",
      roles: ["ADMIN"], // 父路由添加
    },
    children: [
      {
        path: "dashboard",
        name: "adminDashboard",
        component: () => import("@/views/admin/dashboard/index.vue"),
        meta: {
          title: "仪表盘",
          icon: "Dashboard",
          roles: ["ADMIN"], // 子路由也添加
        },
      },
      {
        path: "manage",
        name: "contentManage",
        component: () => import("@/views/admin/manage/index.vue"),
        redirect: "/admin/manage/categories",
        meta: {
          title: "内容管理",
          icon: "Folder",
          roles: ["ADMIN"], // 子路由同样添加
        },
        children: [
          {
            path: "categories",
            name: "categoryManagement",
            component: () => import("@/views/admin/manage/categories.vue"),
            meta: {
              title: "分类管理",
              icon: "FolderOpened",
              roles: ["ADMIN"],
            },
          },
          {
            path: "articles",
            name: "articleManagement",
            component: () => import("@/views/admin/manage/articles.vue"),
            meta: {
              title: "文章管理",
              icon: "Document",
              roles: ["ADMIN"],
            },
          },
        ],
      },
      {
        path: "write",
        name: "writeArticle",
        component: () => import("@/views/admin/write_article/index.vue"),
        meta: {
          title: "撰写文章",
          icon: "Edit",
          roles: ["ADMIN"],
        },
      },
      {
        path: "theme",
        name: "themeManagement",
        component: () => import("@/views/admin/theme/index.vue"),
        meta: {
          title: "主题管理",
          icon: "ColdDrink",
          roles: ["ADMIN"],
        },
      },
      {
        path: "ai",
        name: "aiManagement",
        component: () => import("@/views/admin/ai/index.vue"),
        redirect: "/admin/ai/global-memory",
        meta: {
          title: "AI 管理",
          icon: "MagicStick",
          roles: ["ADMIN"],
        },
        children: [
          {
            path: "global-memory",
            name: "globalMemoryManagement",
            component: () => import("@/views/admin/ai/global-memory.vue"),
            meta: {
              title: "全局记忆管理",
              icon: "Collection",
              roles: ["ADMIN"],
            },
          },
          {
            path: "llm-config",
            name: "llmConfigManagement",
            component: () => import("@/views/admin/ai/llm-config.vue"),
            meta: {
              title: "AI配置管理",
              icon: "Connection",
              roles: ["ADMIN"],
            },
          },
          {
            path: "personas",
            name: "personaManagement",
            component: () => import("@/views/admin/ai/personas.vue"),
            meta: {
              title: "角色管理",
              icon: "Avatar",
              roles: ["ADMIN"],
            },
          },
          {
            path: "toolbox",
            name: "toolboxManagement",
            component: () => import("@/views/admin/ai/toolbox.vue"),
            meta: {
              title: "工具箱",
              icon: "Box",
              roles: ["ADMIN"],
            },
          },
        ],
      },
      {
        path: "settings",
        name: "blogSettings",
        component: () => import("@/views/admin/settings/index.vue"),
        meta: {
          title: "博客设置",
          icon: "Setting",
          roles: ["ADMIN"],
        },
      },
    ],
  },
]
