puts "Destroying restaurants..."
Restaurant.destroy_all

puts "Creating restaurants and reviews..."
2.times { Restaurant.create!(name: Faker::Restaurant.name, address: Faker::Address.full_address) }
3.times do
  restaurant = Restaurant.create!(name: Faker::Restaurant.name, address: Faker::Address.full_address)
  100.times do
    Review.create!(content: Faker::Restaurant.review, restaurant: restaurant)
  end
end

puts "Created #{Restaurant.count} restaurants and #{Review.count} reviews."