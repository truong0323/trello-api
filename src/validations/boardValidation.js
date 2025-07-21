/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'

import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
const createNew = async (req, res, next ) => {
    const correctCondition = Joi.object({
        title: Joi.string().required().min(3).max(50).trim().strict().messages({
            'any.required': 'title is required',
            'string.empty': '{{#label}} is not allowed to be empty 1',
            'string.max': '{{#label}} length must be less than or equal to {{#limit}} characters long',
            'string.min': '{{#label}} length must be at least {{#limit}} characters long',
            'string.trim': '{{#label}} must not have leading or trailing whitespace',

        }),
        description: Joi.string().required().min(3).max(256).trim().strict(),
        type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
    })
    try {
        
        //chỉ định abortEarly (thư viện joi) : false để trường hợp cso nhiều lỗivalidation thì trả về tất cả 
        await correctCondition.validateAsync(req.body, {abortEarly : false})
        //validate dữ liệu hợp lệ thì cho request đi tiếp sang controller
        next()
    }
    catch (error) {
        const errorMesage = new Error(error).message
        const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY , errorMesage)
        next(customError)
        // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        //     errors: new Error(error).message
       
        // })
        //trả về 422 : không thể xử lí dữ liệu
    }

    
}

export const boardValidation = {
    createNew

}