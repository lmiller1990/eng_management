import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  memos: HTMLTableRowElement[] = [];
  index = 0;

  connect(): void {
    this.handleKeydown = this.handleKeydown.bind(this);
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
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  private handleKeydown(event: KeyboardEvent) {
    console.log(event.key);

    if (event.key === "Enter") {
      console.log();
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
