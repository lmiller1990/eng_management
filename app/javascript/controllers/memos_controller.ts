import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  memos: HTMLTableRowElement[] = [];
  index = 0;

  connect(): void {
    this.handleKeydown = this.handleKeydown.bind(this);
    this.mouseenter = this.mouseenter.bind(this);
    document.addEventListener("keydown", this.handleKeydown);
    const $tbody = this.element.querySelector("tbody");
    if (!$tbody) {
      // no memos
      return;
    }

    this.memos = Array.from($tbody.querySelectorAll("tr"));
    if (!this.memos.length) {
      return;
    }

    this.memos[this.index].classList.toggle("highlighted");

    for (const memo of this.memos) {
      memo.addEventListener("mouseenter", this.mouseenter);
    }
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  mouseenter(event: MouseEvent) {
    this.removeAllHighlighted();

    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    const idx = event.currentTarget.dataset["index"];

    if (!idx) {
      throw new Error(`Should have data-index.`);
    }

    this.index = parseInt(idx, 10);
    this.memos[this.index].classList.add("highlighted");
    console.info(`Set index to ${this.index}`);
  }

  removeAllHighlighted() {
    for (const memo of this.memos) {
      memo.classList.remove("highlighted");
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const url = this.memos[this.index].dataset["url"];
      if (!url) {
        console.error(`Missing data-url on element: `, this.memos[this.index]);
        return;
      }
      Turbo.visit(url);
    }

    if (event.key === "j") {
      if (this.index >= this.memos.length - 1) {
        return;
      }
      this.memos[this.index].classList.remove("highlighted");
      this.index++;
      this.memos[this.index].classList.add("highlighted");
      return;
    }

    if (event.key === "k") {
      if (this.index > 0) {
        this.memos[this.index].classList.remove("highlighted");
        this.index--;
        this.memos[this.index].classList.add("highlighted");
      }
      return;
    }
  }
}
