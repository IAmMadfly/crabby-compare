import { open } from '@tauri-apps/api/dialog'
import { listen } from '@tauri-apps/api/event'
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import "./App.css";
import { For, createSignal, onMount } from 'solid-js';

function App() {
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
    })
  })

  async function handleOpen() {
    const selected = await open({
      title: "Select directory",
      multiple: false,
      directory: true
    });

    await invoke("set_directory", { directory: selected });

    // console.log(selected);
  }

  return (
    <div class="container">
      <button onClick={() => { handleOpen() }}>Select directory</button>
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
  );
}

export default App;
