// middlewares/validateDto.js
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const validateDto = (DtoClass) => async (req, res, next) => {
  const dtoObj = plainToInstance(DtoClass, req.body);
  const errors = await validate(dtoObj);

  if (errors.length > 0) {
    const messages = errors
      .map(err => Object.values(err.constraints))
      .flat();
    return res.status(400).json({ success: false, message: messages });
  }

  req.body = dtoObj;
  next();
};
