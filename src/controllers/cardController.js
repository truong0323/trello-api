/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
const createNew = async (req, res, next) => {
    try {
       
        // console.log('req.body : ',req.body);
        // điều hướng dữ liệu sang service
        const createdCard = await cardService.createNew(req.body)

        res.status(StatusCodes.CREATED).json(createdCard ) 
    }
    catch (error) {
        next(error) 
    }

}
const update = async( req,res,next) =>{
    try {
        const cardId = req.params.id
        const cardCoverFile  = req.file
        const userInfo = req.jwtDecoded
        console.log('userInfo:', userInfo)
        const updateCard = await cardService.update(cardId , req.body, cardCoverFile, userInfo)
        res.status(StatusCodes.OK).json(updateCard)
    } catch (error) {
        next(error)
    }
}

export const cardController = {
    createNew,
    update
}