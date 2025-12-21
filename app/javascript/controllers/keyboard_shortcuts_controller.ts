import { Controller } from "@hotwired/stimulus"
import { visit } from "@hotwired/turbo"

export default class extends Controller {
  static values = {
    page: String
  }

  declare pageValue: string

  connect() {
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener("keydown", this.handleKeydown)
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown)
  }

  private handleKeydown(event: KeyboardEvent) {
    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return
    }

    // Global shortcuts
    if (event.key === "m") {
      event.preventDefault()
      visit("/memos")
      return
    }

    if (event.key === "p") {
      event.preventDefault()
      visit("/teams")
      return
    }

    // Page-specific shortcuts for memos index
    if (this.pageValue === "memos-index") {
      if (event.key === "n") {
        event.preventDefault()
        visit("/memos/new")
        return
      }
    }
  }
}
