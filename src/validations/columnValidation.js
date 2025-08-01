/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next ) => {
    const correctCondition = Joi.object({
        boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        title: Joi.string().required().min(3).max(50).trim().strict()

    })
    try {
        
        await correctCondition.validateAsync(req.body, {abortEarly : false})
       
        next()
    }
    catch (error) {
        const errorMesage = new Error(error).message
        const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY , errorMesage)
        next(customError)
    }

    
}
const update = async (req, res, next ) => {
    //lưu ý không require trong trường hợp update
    const correctCondition = Joi.object({
        
        // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        title: Joi.string().min(3).max(50).trim().strict(),

        cardOrderIds: Joi.array().items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        ),
    })
    try {
        
        //chỉ định abortEarly (thư viện joi) : false để trường hợp cso nhiều lỗivalidation thì trả về tất cả 
        await correctCondition.validateAsync(req.body, {abortEarly : false,
            allowUnknown: true // đối với trường hợp update cho phép unknown để không cần đẩy 1 số field lên 
        })
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
const deleteItem = async (req, res, next ) => {
    //lưu ý không require trong trường hợp update
    const correctCondition = Joi.object({
        id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        
    })
    try {
        
        //chỉ định abortEarly (thư viện joi) : false để trường hợp cso nhiều lỗivalidation thì trả về tất cả 
        await correctCondition.validateAsync(req.params)
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

export const columnValidation = {
    createNew,
    update,
    deleteItem
}