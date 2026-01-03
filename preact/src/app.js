import { html } from "htm/preact";
import { useState } from "preact/hooks";

export function App() {
  const [count, setCount] = useState(0);

  function handleIncrement() {
    setCount(count + 1);
  }

  function handleDecrement() {
    setCount(count - 1);
  }

  return html`
    <section class="space-y-4 text-center p-6 max-w-md mx-auto">
      <h1 class="text-2xl font-semibold border-b border-base-300 pb-2">
        Simple Counter
      </h1>
      <p class="text-lg">Count: ${count}</p>
      <div class="flex justify-center gap-4">
        <button class="btn btn-error" onClick=${handleDecrement}>
          Decrement
        </button>
        <button class="btn btn-success" onClick=${handleIncrement}>
          Increment
        </button>
      </div>
    </section>
  `;
}
