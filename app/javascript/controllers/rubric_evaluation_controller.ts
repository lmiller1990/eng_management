import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    evaluationId: String,
  };

  static targets = ["modal", "frame", "grid"];

  declare readonly evaluationIdValue: string;
  declare readonly modalTarget: HTMLDialogElement;
  declare readonly frameTarget: HTMLElement;
  declare readonly gridTargets: HTMLElement[];

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
    this.updateGridColumns();
  }

  updateGridColumns(): void {
    // Count visible columns by checking grid items with data-job-name that are not hidden
    const visibleColumns = this.element.querySelectorAll<HTMLElement>(
      ".grid-column-item:not(.hidden)",
    );

    // Get unique job names from visible columns
    const visibleJobNames = new Set<string>();
    visibleColumns.forEach((col) => {
      const jobName = col.dataset.jobName;
      if (jobName) visibleJobNames.add(jobName);
    });

    const columnCount = visibleJobNames.size;

    // Update all grids with new column template
    this.gridTargets.forEach((grid) => {
      grid.style.gridTemplateColumns = `minmax(200px, 1fr) repeat(${columnCount}, minmax(150px, 1fr))`;
    });
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
    const cells = this.element.querySelectorAll<HTMLElement>(
      `[data-job-name="${jobName}"]`,
    );
    cells.forEach((cell) => cell.classList.add("hidden"));
    // Note: updateGridColumns is called once after all columns are processed in connect()
  }

  toggleColumn(event: MouseEvent) {
    const id = (event.currentTarget as HTMLInputElement).id;
    const checked = (event.currentTarget as HTMLInputElement).checked;
    const cells = this.element.querySelectorAll<HTMLElement>(
      `[data-job-name="${id}"]`,
    );
    cells.forEach((cell) => {
      if (checked) {
        cell.classList.remove("hidden");
      } else {
        cell.classList.add("hidden");
      }
    });

    let filters = this.getStoredFilters();

    if (filters.includes(id)) {
      filters = filters.filter((x) => x !== id);
    } else {
      filters.push(id);
    }

    this.setStoredFilters(filters);
    this.updateGridColumns();
  }
}
