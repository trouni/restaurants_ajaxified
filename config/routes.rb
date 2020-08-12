Rails.application.routes.draw do
  root to: 'restaurants#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  resources :restaurants, only: [ :index, :show ] do
    resources :reviews, only: :create
  end
end
