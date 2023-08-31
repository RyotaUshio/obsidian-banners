import { plug } from "src/main";
import bannerField from "./extensions/bannerField";
import bannerExtender from "./extensions/bannerExtender";
import { leafBannerMap, openNoteEffect, removeBannerEffect } from "./extensions/utils";

export const loadExtensions = () => {
  plug.registerEditorExtension([
    bannerExtender,
    bannerField
  ]);

  /** Listener used to remove unused banners when switching to reading view,
   * as well as to assign the correct banners when opening/switching notes in an editor
   */
  plug.registerEvent(
    plug.app.workspace.on('layout-change', () => {
      plug.app.workspace.iterateRootLeaves((leaf) => {
        const { id, view } = leaf;
        const effect = view.currentMode.type === 'source' ? openNoteEffect.of(leafBannerMap[id]) : removeBannerEffect.of(null);
        view.editor.cm.dispatch({ effects: effect });
      });
    })
  );

  // Properly insert a banner upon loading the banner
  plug.app.workspace.iterateRootLeaves((leaf) => {
    const { view } = leaf;
    if (view.currentMode.type === 'source') {
      view.editor.cm.dispatch({ effects: openNoteEffect.of(null) });
    }
  });
}

export const unloadEditingViewBanners = () => {
  for (const banner of Object.values(leafBannerMap)) {
    banner?.$destroy();
  }
  document.querySelectorAll('.obsidian-banner-wrapper').forEach((el) => el.remove());
}