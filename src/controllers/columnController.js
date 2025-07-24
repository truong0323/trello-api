/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'
const createNew = async (req, res, next) => {
    try {
       
        // console.log('req.body : ',req.body);
        // điều hướng dữ liệu sang service
        const createdColumn = await columnService.createNew(req.body)
        
        res.status(StatusCodes.CREATED).json(createdColumn ) 
    }
    catch (error) {
        next(error) 
    }
}

export const columnController = {
    createNew,
}