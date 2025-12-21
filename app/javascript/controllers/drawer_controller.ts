import { Controller } from "@hotwired/stimulus"

const STORAGE_KEY = "drawer-open"

export default class extends Controller {
  static targets = ["checkbox"]
  static values = {
    key: String
  }

  declare checkboxTarget: HTMLInputElement
  declare readonly keyValue: string | undefined

  connect() {
    // Restore persisted state; if nothing persisted, keep the default
    const persisted = window.localStorage.getItem(this.storageKey)
    if (persisted !== null) {
      this.checkboxTarget.checked = persisted === "true"
    }
  }

  persist() {
    window.localStorage.setItem(
      this.storageKey,
      this.checkboxTarget.checked ? "true" : "false"
    )
  }

  private get storageKey() {
    // Prefer a provided key; fall back to the element id so multiple drawers can coexist
    return `drawer-${this.keyValue || this.checkboxTarget.id || STORAGE_KEY}`
  }
}
