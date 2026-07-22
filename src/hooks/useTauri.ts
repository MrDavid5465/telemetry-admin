import { invoke } from "@tauri-apps/api/core";

export function useTauri() {
  async function parseEffects() {
    return (await invoke("parse_effects")) as any;
  }

  async function writeEffects(effects: any) {
    return await invoke("write_effects", { effects });
  }

  async function reloadMonocoque() {
    return await invoke("reload_monocoque");
  }

  return { parseEffects, writeEffects, reloadMonocoque };
}
