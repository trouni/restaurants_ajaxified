import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "reviews" ]

  connect() {
    let page = 1
    // 1. Add listener for the scroll
    document.addEventListener('scroll', _ => {
      // 2. When the scroll hits the bottom:
      if (window.innerHeight + window.scrollY === document.body.scrollHeight) {
        // 3. increment page
        page += 1
        // 4. Fetch and insert reviews
        this.loadPage(page)
      }
    })
  }

  loadPage(page) {
    this.reviewsTarget.classList.add('loading')
    // 4. fetch the reviews for that page
    fetch(`?page=${page}`, { headers: { Accept: 'application/json' }})
    .then(response => response.json())
    .then(data => {
      // 5. Insert the new reviews into the html
      this.reviewsTarget.insertAdjacentHTML('beforeEnd', data.reviews)
      this.reviewsTarget.classList.remove('loading')
    })
  }

  logScroll(event) {
    console.log(event)
  }
}
