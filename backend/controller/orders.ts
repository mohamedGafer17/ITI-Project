import ordersModel from "../models/ordersModel";
import { Orders } from "../interface/orders";
import { getAll, getOne } from "./refactorHandlind";
import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from "express";
import { FilterData } from "../interface/filterData";
import cartsModel from "../models/cartsModel";
import ApiErrors from "../utils/apiError";
import { CartItems } from "../interface/cart";
import productsModel from "../models/productsModel";

export const getAllOrders = getAll<Orders>(ordersModel, 'orders');
export const getOrder = getOne<Orders>(ordersModel)


export const filterOrders = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  const filterData: FilterData = {};
  if (req.user?.role === 'user') { filterData.user = req.user._id };
  next();
});



export const createCashOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const taxPrice: number = 50;
  const cart: any = await cartsModel.findOne({ user: req.user?._id });
  if (!cart) { return next(new ApiErrors("you don't have cart to checkout", 400)) };
  const order = await ordersModel.create({
    items: cart.items,
    taxPrice,
    totalPrice: cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalPrice,
    address: req.body.address,
    user: req.user?._id
  });
  const bulkOption = cart.items.map((item: CartItems) => ({
    updateOne: {
      filter: { _id: item.product._id },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } }
    },
  }))
  await productsModel.bulkWrite(bulkOption);
  await cartsModel.deleteOne({ user: req.user?._id });
  res.status(200).json({ data: order })
});


export const payOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const order = await ordersModel.findByIdAndUpdate(req.params.id, {
    isPaid: true,
    paidAt: Date.now()
  }, { new: true })
  res.status(200).json({ data: order })
});


export const deliverOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const order = await ordersModel.findByIdAndUpdate(req.params.id, {
    isDelivered: true,
    deliveredAt: Date.now()
  }, { new: true })
  res.status(200).json({ data: order })
});