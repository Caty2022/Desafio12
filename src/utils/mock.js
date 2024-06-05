const { faker } = require("@faker-js/faker");

const generateProduct = () => {
  const id = faker.database.mongodbObjectId();
  const title = faker.commerce.productName();
  const price = faker.commerce.price();
  const stock = parseInt(faker.string.numeric());
  const description = faker.commerce.productDescription();
  const code = faker.commerce.isbn();
  const status = true;
  const category = faker.commerce.productMaterial();
  const thumbnail = faker.image.avatar();

  return {
    id,
    title,
    price,
    stock,
    description,
    code,
    status,
    category,
    thumbnail,
  };
};

module.exports = { generateProduct };
