import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    evaluationId: String,
  };

  declare readonly evaluationIdValue: string;

  openCell(event: Event) {
    const cell = event.currentTarget as HTMLElement;
    const dimensionId = cell.dataset.dimensionId;
    const jobTitleId = cell.dataset.jobTitleId;

    console.log("Cell clicked:", {
      evaluationId: this.evaluationIdValue,
      dimensionId,
      jobTitleId,
    });
  }
}
