/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {
    try {
       
        // console.log('req.body : ',req.body);
        // điều hướng dữ liệu sang service
        const createBoard = await boardService.createNew(req.body)

        res.status(StatusCodes.CREATED).json({  createBoard }) 
    }
    catch (error) {
        
        // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        //     errors: error.message
        // }) //trả về 422 : không thể xử lí dữ liệu
        next(error) 
    }

}
export const boardController = {
    createNew
}