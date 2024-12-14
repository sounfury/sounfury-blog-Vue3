export const frontRoutes = [
  {
    path: "/",
    redirect: "/home",
    name: "front",
    component: () => import("@/views/front/index.vue"),
    children: [
      {
        path: "/home",
        component: () => import("@/views/front/home/index.vue"),
      },
      {
        path: "/article/:id", //博文详情页
        name: "Article",
        component: () => import("@/views/front/article/index.vue"),
      },
      {
        path: "/archive/:year/:month", //归档页
        name: "archive-month",
        component: () => import("@/views/front/archive/index.vue"),
      },
      {
        path: "/archive/:year", //归档页
        name: "archive-year",
        component: () => import("@/views/front/archive/index.vue"),
      },
      {
        path: "/archive", //归档页
        name: "archive",
        component: () => import("@/views/front/archive/index.vue"),
      },
      {
        //分类页
        path: "/category",
        name: "category",
        component: () => import("@/views/front/category/index.vue"),
      },
      {
        //标签页
        path: "/tags",
        name: "tags",
        component: () => import("@/views/front/tags/tags.vue"),
      },
      {
        path: "/tags/:name",
        name: "tag",
        component: () => import("@/views/front/tags/tag.vue"),
      },
    ],
  },
]
