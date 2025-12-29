import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  show(message: string) {
    const toast = this.createToastElement(message);
    this.element.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => toast.remove(), 1000);
  }

  createToastElement(message: string): HTMLElement {
    const div = document.createElement("div");
    div.className = "toast toast-bottom toast-end";
    div.innerHTML = `
        <div class="text-xs">
          <span>${message}</span>
        </div>
      `;
    return div;
  }
}
