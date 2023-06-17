import { open } from '@tauri-apps/api/dialog'
import { listen } from '@tauri-apps/api/event'
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import "./App.css";
import { For, Show, createSignal, onMount } from 'solid-js';

function App() {
  const [dir, setDir] = createSignal<null | string>(null);
  const [image, setImage] = createSignal(new Array<string>())
  const [score, setScore] = createSignal(new Array<string>())


  onMount(() => {
    listen('image', (ev) => {
      console.log(ev);
      setImage([...image(), `${ev.payload}`])
    });
    listen('score', (ev) => {
      console.log(ev);
      setScore([...score(), `${ev.payload}`])
    });
  })

  async function handleOpen() {
    const selected = await open({
      title: "Select directory",
      multiple: false,
      directory: true
    }) as string | null;

    if (!selected) {
      throw new Error("Selected directory is invalid");
    }

    setDir(selected);

    await invoke("set_directory", { directory: selected });
  }

  return (
    <div class="container">
      <div class='flex flex-col'>
        <div>
          <Show when={dir() != null}>
            <span>{dir()}</span>
          </Show>
        </div>
        <button class='btn' onClick={() => { handleOpen() }}>Select directory</button>
        <For each={score()}>
          {(scoreString) => {
            return <span>{scoreString}</span>
          }}
        </For>
        <For each={image()}>
          {(imageSrc) => {
            return <img src={convertFileSrc(imageSrc)}></img>
          }}
        </For>
      </div>
    </div>
  );
}

export default App;
