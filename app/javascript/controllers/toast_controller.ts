import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  div?: HTMLDivElement;

  show(message: string) {
    const toast = this.createToastElement(message);
    this.element.appendChild(toast);

    // Auto-remove after 3 seconds
    // setTimeout(() => toast.remove(), 1000);
  }

  createToastElement(message: string): HTMLElement {
    if (this.div) {
      this.div.remove();
    }
    this.div = document.createElement("div");
    this.div.className = "toast toast-bottom toast-end";
    this.div.innerHTML = `
        <div class="text-xs">
          <span>${message}</span>
        </div>
      `;
    return this.div;
  }
}
