import { Request } from "express"
import multer from "multer"
import ApiErrors from "../utils/apiError"
import { FileFields } from "../interface/uploadFiles"

const uploadOption = (): multer.Multer => {
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, 'uploads')
  //   },
  //   filename(req, file, cb) {
  //     const ext = file.mimetype.split('/')[1];
  //     const imageName: string = `product-${Date.now()}.${ext}`
  //     cb(null, imageName)
  //   },
  // })
  const multerStorage = multer.memoryStorage()

  function multerFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (file.mimetype.startsWith('image')) { cb(null, true) }
    else { cb(new ApiErrors('Not an image! Please upload only images', 400)) }
  }

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
}

export const uploadSingleImage = (fieldName: string) => uploadOption().single(fieldName);
export const uploadMultiImages = (fields: FileFields[]) => uploadOption().fields(fields);