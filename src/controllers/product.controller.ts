import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { logger } from '../config/logger';

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { name, description, price, stock, imageUrl } = req.body;
      
      const product = await productService.createProduct({
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock, 10) : undefined,
        imageUrl,
        userId: req.user.userId,
      });

      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      logger.error('Create product error', error);
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        sendError(res, 'Invalid product ID', 400);
        return;
      }

      const product = await productService.getProductById(productId);
      if (!product) {
        sendError(res, 'Product not found', 404);
        return;
      }

      sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      logger.error('Get product error', error);
      next(error);
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string || '10', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await productService.getAllProducts(limit, offset);
      
      sendSuccess(res, result, 'Products retrieved successfully');
    } catch (error) {
      logger.error('Get all products error', error);
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        sendError(res, 'Invalid product ID', 400);
        return;
      }

      const { name, description, price, stock, imageUrl } = req.body;
      
      const product = await productService.updateProduct(
        productId,
        {
          name,
          description,
          price: price ? parseFloat(price) : undefined,
          stock: stock ? parseInt(stock, 10) : undefined,
          imageUrl,
        },
        req.user.userId
      );

      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      logger.error('Update product error', error);
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        sendError(res, 'Invalid product ID', 400);
        return;
      }

      await productService.deleteProduct(productId, req.user.userId);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      logger.error('Delete product error', error);
      next(error);
    }
  }

  async getMyProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const products = await productService.getProductsByUserId(req.user.userId);
      sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
      logger.error('Get my products error', error);
      next(error);
    }
  }
}

export const productController = new ProductController();

