// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'category_id' });
};

// Categories have many Products
Category.associate = (models) => {
  Category.hasMany(models.Product, { foreignKey: 'category_id' });
};
// Products belongToMany Tags (through ProductTag)
Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'category_id' });
  Product.belongsToMany(models.Tag, { through: models.ProductTag, foreignKey: 'product_id' });
};
// Tags belongToMany Products (through ProductTag)
Tag.associate = (models) => {
  Tag.belongsToMany(models.Product, { through: models.ProductTag, foreignKey: 'tag_id' });
};

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
