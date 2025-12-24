import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url: String,
    field: String
  }

  static targets = ["field"]

  declare readonly urlValue: string
  declare readonly fieldValue: string
  declare readonly fieldTarget: HTMLInputElement

  save() {
    const body = JSON.stringify({
      memo: {
        [this.fieldValue]: this.fieldTarget.value
      }
    })

    console.log(body)
    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
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
