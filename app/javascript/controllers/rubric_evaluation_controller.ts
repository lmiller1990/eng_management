import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    evaluationId: String,
  };

  static targets = ["modal", "frame"];

  declare readonly evaluationIdValue: string;
  declare readonly modalTarget: HTMLDialogElement;
  declare readonly frameTarget: HTMLElement;

  getStoredFilters(): string[] {
    let filters = window.localStorage.getItem("rubric_filter");
    if (filters) {
      return JSON.parse(filters) as string[];
    }

    window.localStorage.setItem("rubric_filter", JSON.stringify([]));
    return [];
  }

  setStoredFilters(filters: string[]) {
    window.localStorage.setItem("rubric_filter", JSON.stringify(filters));
  }

  connect(): void {
    const filters = this.getStoredFilters();
    for (const element of this.element.querySelectorAll<HTMLInputElement>(
      "[data-class='job-filter']",
    )) {
      if (!filters.length) {
        // show all
        element!.checked = true;
      } else if (filters.includes(element.id)) {
        element!.checked = true;
      } else {
        element!.checked = false;
        this.hideByJobName(element.id);
      }
    }
  }

  openCell(event: Event) {
    const cell = event.currentTarget as HTMLElement;
    const dimensionId = cell.dataset.dimensionId;
    const jobTitleId = cell.dataset.jobTitleId;
    console.log({
      cell,
      jobTitleId,
      dimensionId,
    });

    const url = `/dimension_scores/new?dimension_id=${dimensionId}&job_title_id=${jobTitleId}&evaluation_id=${this.evaluationIdValue}`;

    // Set the Turbo Frame src to load the form
    this.frameTarget.setAttribute("src", url);

    this.modalTarget.showModal();
  }

  closeModal() {
    this.modalTarget.close();
    // Clear the frame src to reset for next use
    this.frameTarget.removeAttribute("src");
    // Clear the frame content
    this.frameTarget.innerHTML = "<!-- Form will load here dynamically -->";
  }

  hideByJobName(jobName: string) {
    const cells = this.element.querySelectorAll<HTMLTableCellElement>(
      `[data-job-name="${jobName}"]`,
    );
    cells.forEach((cell) => (cell.hidden = true));
  }

  toggleColumn(event: MouseEvent) {
    const id = (event.currentTarget as HTMLInputElement).id;
    const checked = (event.currentTarget as HTMLInputElement).checked;
    const cells = this.element.querySelectorAll<HTMLTableCellElement>(
      `[data-job-name="${id}"]`,
    );
    cells.forEach((cell) => (cell.hidden = !checked));

    let filters = this.getStoredFilters();

    if (filters.includes(id)) {
      filters = filters.filter((x) => x !== id);
    } else {
      filters.push(id);
    }

    this.setStoredFilters(filters);
  }
}
