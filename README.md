# Creating JavaScript components with Stimulus

---

## Example component: Inline Modal

Let's create an "inline modal" component for the `reviews#new` form, that expands when we click on a button.


### Stimulus Controller

```shell
touch app/javascript/controllers/inline_modal_controller.js
```
```js
import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    console.log(`Hello from the ${this.identifier} controller!`);
  }
}
```


### Data-controller

Connect the component to the `inline_modal` controller by adding a `data-controller` attribute.

```erb
<!-- app/views/restaurants/show.html.erb -->

<div data-controller="inline-modal"> <!-- create a container for our new component -->
  <button class="btn btn-outline-primary">Leave a review</button>

  <%= simple_form_for([ @restaurant, @review ], remote: true) do |f| %>
    <!-- [...] -->
  <% end %>
</div>
```
Set the `data-controller` in a div that contains both:
- the element listening to an event (the button)
- the element you want to update (the form)


### Data-target

`data-target` is the equivalent of `document.querySelector`

```erb
<%= simple_form_for([ @restaurant, @review ],
                    html: { data: { target: 'inline-modal.form' } },
                    remote: true) do |f| %>
```

Simple form will generate a form tag like this:

```html
<form action="..." data-target="inline-modal.form" ... >
```

`data-target="controller-name.targetName"`


### Targets

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'form' ];

  connect() {
    console.log(this.formTarget);
  }
}
```

`this.countTarget` returns the first one, `this.countTargets` returns them all


### Connect

Set the initial state of the form in the `connect()` action.

```js
export default class extends Controller {
  static targets = [ 'form' ];

  connect() {
    this.formTarget.style.height = "0"
    this.formTarget.style.overflow = "hidden"
    this.formTarget.style.transition = "height 0.2s ease-in"
  }
}
```


### Data-Action

Listening to the `click` event on the button (`addEventListener`):

```erb
<!-- app/views/restaurants/show.html.erb -->

<div data-controller="inline-modal">
  <button class="btn btn-outline-primary"
          data-action="click->inline-modal#openModal">Leave a review</button>
  <!-- [...] -->
</div>
```

Syntax: `event->controller-name#actionName`


### Action

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [ 'form' ];
  // ...
  openModal(event) {
    console.log(event);
  }
}
```

Let’s expand the form!


### Settings

Use data attributes to add settings to your component

```erb
  <div data-controller="inline-modal" data-expanded-height="150">
```

```js
openModal(event) {
  this.formTarget.style.height = this.element.dataset.expandedHeight + 'px'
  event.currentTarget.remove() // Remove the button after expanding the form
}
```


### Additional actions

```erb
<div data-controller="inline-modal" data-expanded-height=150>
  <!-- [...] -->
  <%= f.input :content, as: :text,
    label: false,
    input_html: {
      placeholder: 'Press enter to submit your review.',
      data: { action: 'keydown->inline-modal#submitOnEnter' }
    } %>
</div>
```

```js
export default class extends Controller {
  // ...
  submitOnEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      this.formTarget.submit()
    }
  }
}
```

---

## Stimulus + AJAX: Infinite Scroll

Let's build a new component in Stimulus that will use AJAX to fetch new pages of reviews as we scroll down.


### Listen to the scroll

Create a new controller for this new component

```shell
touch app/javascript/controllers/infinite_scroll_controller.js
```

Detect when the user has scrolled to the bottom of the reviews

```js
import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    document.addEventListener('scroll', _ => {
      if (window.innerHeight + window.scrollY === document.body.scrollHeight) {
        console.log("Scrolled to bottom of the screen!")
      }
    })
  }
}
```


### Paginate the reviews

Install the `will_paginate` gem

```rb
# Gemfile
gem 'will_paginate'
```

```rb
# app/controllers/restaurants_controller.rb
# [...]
  def show
    @restaurant = Restaurant.find(params[:id])
    @review = Review.new
    @reviews = @restaurant.reviews.paginate(page: params[:page], per_page: 10)
  end
```


### Render json

Rails controllers can render different formats based on the request’s “Accept” header:

```rb
# app/controllers/restaurants_controller.rb
# [...]
  def show
    # ...
    respond_to do |format|
      format.html
      format.json do
        render json: {
          restaurant: @restaurants,
          reviews: @reviews
        }
      end
    end
  end
```

It will answer to our fetch call with a JSON file


### Fetch reviews

```js
import { Controller } from "stimulus";

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
    .then(data => console.log(data))
  }
}
```

Don’t forget the “Accept” header!


### Problem

The front-end doesn't have access to our HTML partials


### Update the view

Create a `page` partial for the reviews

```erb
<!-- app/views/reviews/_page.html.erb -->
<% reviews.each do |review| %>
  <%= render 'reviews/card', review: review %>
<% end %>
```

```erb
<!-- app/views/restaurants/show.html.erb -->
<%= render 'reviews/page', reviews: @reviews %>
```


### Render to string

We want to send the pre-formatted cards to our front-end

```rb
# app/controllers/restaurants_controller.rb
# [...]
  def show
    # ...
    respond_to do |format|
      format.html
      format.json do
        render json: {
          restaurant: @restaurants,
          reviews: @reviews,
          reviewsHTML: render_to_string(
            partial: 'reviews/page',
            locals: { reviews: @reviews },
            formats: :html
          )
        }
      end
    end
  end
```


### Insert in the DOM

```js
import { Controller } from "stimulus";

export default class extends Controller {
  // ...
  loadPage(page) {
    fetch(`?page=${page}`, { headers: { Accept: 'application/json' }})
    .then(response => response.json())
    .then(data => this.element.insertAdjacentHTML('beforeEnd', data.reviews))
  }
}
```
