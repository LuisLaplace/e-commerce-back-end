const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ]
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const { product_name, price, stock, tagIds } = req.body;

    // Create the product
    const product = await Product.create({ product_name, price, stock });

    // If there are tagIds, associate tags with the product
    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);

      // Fetch the product again to include associated tags in the response
      const productWithTags = await Product.findByPk(product.id, {
        include: [{ model: Tag, through: ProductTag }],
      });

      res.status(200).json(productWithTags);
    } else {
      // If no tagIds provided, respond with the product only
      res.status(200).json(product);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});


// update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const updatedProduct = await Product.update(req.body, {
      where: { id: req.params.id },
    });

    // Update product tags
    if (req.body.tagIds && req.body.tagIds.length) {
      const currentProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });
      const currentProductTagIds = currentProductTags.map(({ tag_id }) => tag_id);

      const newProductTags = req.body.tagIds
        .filter((tag_id) => !currentProductTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      const removedProductTags = currentProductTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: removedProductTags } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id },
    });

    if (!deletedProduct) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


module.exports = router;
