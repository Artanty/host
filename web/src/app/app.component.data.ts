// дублирование ([key] = remoteName) для возможного разруливания конфликта имен 
// или возможности загрузки нескольких инстансов - todo пробовать.
// exposedModule не вынесено за скобки для возможности загружать компонент, а не модуль.

import { Remotes } from "./app.component.types";

//[key] всегда равняется роуту.
export const remotes: Remotes = {
  
  au: {
    preload: true,
    url: `${process.env["AU_WEB_URL"]}`,
    buttonName: 'AU',
    buttonTitle: 'Аутентификация',
    remoteModuleScript: {
      remoteName: "au",
      remoteEntry: `${process.env["AU_WEB_URL"]}/remoteEntry2.js`,
      exposedModule: "./AuthModule",
    },
    routerPath: "au",
    moduleName: "AuthModule",
  },
  faq: {
    preload: false,
    // preload: true,
    url: `${process.env["FAQ_WEB_URL"]}`,
    buttonName: 'テスト',
    buttonTitle: 'Экзамен',
    remoteModuleScript: {
      remoteName: "faq",
      remoteEntry: `${process.env["FAQ_WEB_URL"]}/remoteEntry1.js`,
      exposedModule: "./FaqModule",
    },
    routerPath: "faq",
    moduleName: "FaqModule"
  },
  doro: {
    preload: false,
    // preload: true,
    url: `${process.env["DORO_WEB_URL"]}`,
    buttonName: '토마토',
    buttonTitle: '',
    remoteModuleScript: {
      remoteName: "doro",
      remoteEntry: `${process.env["DORO_WEB_URL"]}/remoteEntry3.js`,
      exposedModule: "./DoroModule",
    },
    routerPath: "doro",
    moduleName: "DoroModule"
  },

  // test: {
  // preload: false,
  //   url: `${process.env["FAQ_WEB_URL"]}`,
  //   buttonName: 'test',
  //   buttonTitle: 'test',
  //   remoteModuleScript: {
  //     remoteName: "faq",
  //     remoteEntry: `${process.env["FAQ_WEB_URL"]}/remoteEntry.js`,
  //     exposedModule: "./Module",
  //   },
  //   routerPath: "test",
  //   moduleName: "FaqModule"
  // }
}

export const remotesFaq: Remotes = {
  faq: {
    preload: false,
    url: `http://localhost:5221`,
    buttonName: 'テスト',
    buttonTitle: 'Экзамен',
    remoteModuleScript: {
      remoteName: "faq55", // !
      remoteEntry: `http://localhost:5221/remoteEntry1.55.js`, // !
      exposedModule: "./FaqModule55", // !
    },
    routerPath: "faq",
    moduleName: "FaqModule"
  },
}