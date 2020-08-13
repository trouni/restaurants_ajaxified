import { Controller } from "stimulus"

export default class extends Controller {

  connect() {
    let page = 1
    document.addEventListener('scroll', _ => {
      if (window.innerHeight + window.scrollY === document.body.scrollHeight) {
        page += 1
        this.loadPage(page)
      }
    })
  }

  loadPage(page) {
    fetch(`?page=${page}`, { headers: { Accept: 'application/json' }})
    .then(response => response.json())
    .then(data => {
      this.element.insertAdjacentHTML('beforeEnd', data.reviewsHTML)
    })
  }
}
