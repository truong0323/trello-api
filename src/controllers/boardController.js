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
        const createdBoard = await boardService.createNew(req.body)

        res.status(StatusCodes.CREATED).json({  createdBoard }) 
    }
    catch (error) {
        
        // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        //     errors: error.message
        // }) //trả về 422 : không thể xử lí dữ liệu
        next(error) 
    }

}
const getDetails = async (req, res, next) => {
    try {
       
        // console.log('req.params : ',req.params);

        const boardId = req.params.id

        // điều hướng dữ liệu sang service
        const board = await boardService.getDetails(boardId)

        res.status(StatusCodes.OK).json( board ) 
    }
    catch (error) { next(error)}
}
const update = async (req, res, next) => {
    try {
       
        // console.log('req.params : ',req.params);

        const boardId = req.params.id

        // điều hướng dữ liệu sang service
        const updateBoard = await boardService.update(boardId, req.body)

        res.status(StatusCodes.OK).json( updateBoard ) 
    }
    catch (error) { next(error)}
}
const moveCardToDifferentColumn = async (req, res, next) => {
    try {
       
        // điều hướng dữ liệu sang service
        const result = await boardService.moveCardToDifferentColumn(req.body)

        res.status(StatusCodes.OK).json( result ) 
    }
    catch (error) { next(error)}
}
export const boardController = {
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn
}