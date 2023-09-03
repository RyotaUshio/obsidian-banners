import { Plugin } from "obsidian";
import { loadPostProcessor, unloadReadingViewBanners } from "./reading";
import { loadExtensions, unloadEditingViewBanners } from "./editing";
import { loadSettings, type BannerSettings } from "./settings";
import BannerEvents from "./BannerEvents";

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  settings!: BannerSettings;
  events!: BannerEvents;

  async onload() {
    console.log('Loading Banners 2...');
    plug = this;
    this.events = new BannerEvents();

    await loadSettings();
    loadPostProcessor();
    loadExtensions();
    this.events.loadEvents();
  }

  async onunload() {
    console.log('Unloading Banners 2...');

    unloadEditingViewBanners();
    unloadReadingViewBanners();
  }
}
