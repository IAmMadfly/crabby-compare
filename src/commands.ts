import { invoke } from "@tauri-apps/api/tauri";

export async function selectDirectory(path: string) {
  await invoke("set_directory", { directory: path });
}
