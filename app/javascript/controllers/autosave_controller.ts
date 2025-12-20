import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url: String
  }

  static targets = ["field"]

  declare readonly urlValue: string
  declare readonly fieldTarget: HTMLInputElement

  save() {
    const fieldName = this.fieldTarget.name.match(/\[([^\]]+)\]$/)?.[1]

    if (!fieldName) {
      console.error("Could not extract field name from input")
      return
    }

    const body = JSON.stringify({
      memo: {
        [fieldName]: this.fieldTarget.value
      }
    })

    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken()
      },
      body
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(() => {
        // Optional: Show save indicator
        console.log("Saved successfully")
      })
      .catch(error => {
        console.error("Save failed:", error)
      })
  }

  private csrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
    return meta?.content || ""
  }
}
