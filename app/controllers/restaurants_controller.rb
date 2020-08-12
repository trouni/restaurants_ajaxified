class RestaurantsController < ApplicationController
  def index
    @restaurants = Restaurant.all
  end

  def show
    @restaurant = Restaurant.find(params[:id])
    @review = Review.new
    @reviews = @restaurant.reviews.paginate(page: params[:page], per_page: 10).order(created_at: :desc)
    respond_to do |format|
      format.html
      format.json do
        render json: {
          reviews: render_to_string(partial: 'reviews/page', locals: { reviews: @reviews }, formats: :html)
        }
      end
    end
  end
end
