import { Controller } from "@hotwired/stimulus";
import { csrfToken } from "../utils/csrf";

export default class extends Controller {
  static values = {
    url: String,
    field: String,
  };

  static targets = ["field"];

  declare readonly urlValue: string;
  declare readonly fieldValue: string;
  declare readonly fieldTarget: HTMLInputElement;

  save() {
    const body = JSON.stringify({
      memo: {
        [this.fieldValue]: this.fieldTarget.value,
      },
    });

    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        // Optional: Show save indicator
        console.log("Saved successfully");
      })
      .catch((error) => {
        console.error("Save failed:", error);
      });
  }
}
