import productsModel from "../models/productsModel";
import { Products } from "../interface/products";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./refactorHandlind";
import multer from "multer";
import { uploadMultiImages } from "../middlewares/uploadImages";
import sharp from 'sharp';
import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from "express";
export const uploadProductImages = uploadMultiImages([{ name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 5 }])
export const resizeProductImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.files) {
      if (req.files.cover) {
        const imgName = `product-${Date.now()}-cover.webp`
        await sharp(req.files.cover[0].buffer)
          .resize(500, 500)
          .toFormat('webp')
          .webp({ quality: 95 })
          .toFile(`uploads/images/products/${imgName}`)
        req.body.cover = imgName;
      }
      if (req.files.images) {
        req.body.images = [];
        await Promise.all(req.files.images.map(async (image: any, index: number) => {
          const imgName = `product-${Date.now()}N${index}-.webp`;
          await sharp(image.buffer)
            .toFormat('webp')
            .webp({ quality: 95 })
            .toFile(`uploads/images/products/${imgName}`)
          req.body.images.push(imgName);
        }))
      }
    }
    next();
  })


export const getAllProducts = getAll<Products>(productsModel, 'products');
export const createProduct = createOne<Products>(productsModel);
export const getProduct = getOne<Products>(productsModel, 'reviews');
export const updateProduct = updateOne<Products>(productsModel)
export const deleteProduct = deleteOne<Products>(productsModel)