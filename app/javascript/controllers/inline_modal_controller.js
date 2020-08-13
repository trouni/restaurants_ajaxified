import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "form" ]

  connect() {
    this.formTarget.style.height = "0"
    this.formTarget.style.overflow = "hidden"
    this.formTarget.style.transition = "height 0.2s ease-in"
  }

  openModal(event) {
    this.formTarget.style.height = this.element.dataset.expandedHeight
    event.currentTarget.remove()
  }

  submitOnEnter(event) {
    if (!event.shiftKey && event.key === 'Enter') {
      event.preventDefault()
      this.formTarget.submit()
    }
  }
}
