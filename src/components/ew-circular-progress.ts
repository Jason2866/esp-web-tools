import { CircularProgress } from "@material/web/progress/internal/circular-progress.js";
import { styles } from "@material/web/progress/internal/circular-progress-styles.js";

export class EwCircularProgress extends CircularProgress {
  static override styles = [styles];
}

customElements.define("ew-circular-progress", EwCircularProgress);

declare global {
  interface HTMLElementTagNameMap {
    "ew-circular-progress": EwCircularProgress;
  }
}
