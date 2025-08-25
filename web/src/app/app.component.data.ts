// дублирование ([key] = remoteName) для возможного разруливания конфликта имен 
// или возможности загрузки нескольких инстансов - todo пробовать.
// exposedModule не вынесено за скобки для возможности загружать компонент, а не модуль.

import { Remotes } from "./app.component.types";

//[key] всегда равняется роуту.
export const remotes: Remotes = {
  gui: {
    preload: true,
    url: `${process.env["GUI_WEB_URL"]}`,
    buttonName: 'gui',
    buttonTitle: 'Библиотека компонентов',
    remoteModuleScript: {
      remoteName: "gui",
      remoteEntry: `${process.env["GUI_WEB_URL"]}/remoteEntry4209.js`,
      exposedModule: "./GuiModule",
    },
    routerPath: "gui",
    moduleName: "GuiModule",
  },
  au: {
    preload: true,
    url: `${process.env["AU_WEB_URL"]}`,
    buttonName: 'au',
    buttonTitle: 'Аутентификация',
    remoteModuleScript: {
      remoteName: "au",
      remoteEntry: `${process.env["AU_WEB_URL"]}/remoteEntry2.js`,
      exposedModule: "./AuthModule",
    },
    routerPath: "au",
    moduleName: "AuthModule",
  },
  note: {
    preload: false,
    // preload: true,
    url: `${process.env["NOTE_WEB_URL"]}`,
    buttonName: 'note',
    buttonTitle: 'Записки',
    remoteModuleScript: {
      remoteName: "note",
      remoteEntry: `${process.env["NOTE_WEB_URL"]}/remoteEntry14.js`,
      exposedModule: "./NoteModule",
    },
    routerPath: "note",
    moduleName: "NoteModule"
  },
  // faq: {
  //   preload: false,
  //   // preload: true,
  //   url: `${process.env["FAQ_WEB_URL"]}`,
  //   buttonName: 'faq', //テスト
  //   buttonTitle: 'Экзамен',
  //   remoteModuleScript: {
  //     remoteName: "faq",
  //     remoteEntry: `${process.env["FAQ_WEB_URL"]}/remoteEntry1.js`,
  //     exposedModule: "./FaqModule",
  //   },
  //   routerPath: "faq",
  //   moduleName: "FaqModule"
  // },
  // doro: {
  //   preload: false,
  //   // preload: true,
  //   url: `${process.env["DORO_WEB_URL"]}`,
  //   buttonName: 'doro', // 토마토
  //   buttonTitle: 'Помидор',
  //   remoteModuleScript: {
  //     remoteName: "doro",
  //     remoteEntry: `${process.env["DORO_WEB_URL"]}/remoteEntry3.js`,
  //     exposedModule: "./DoroModule",
  //   },
  //   routerPath: "doro",
  //   moduleName: "DoroModule"
  // },

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