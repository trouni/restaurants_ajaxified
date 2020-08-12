import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "elementToExpand" ]

  connect() {
    this.elementToExpandTarget.style.height = "0"
    this.elementToExpandTarget.style.transition = "height 0.3s ease-out"
  }

  openElement() {
    this.elementToExpandTarget.style.height = "300px"
    this.elementToExpandTarget.delete()
  }
}
