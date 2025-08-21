//boardroutess
import express from 'express'
import {StatusCodes} from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/AuthMiddleware'
const Router = express.Router()

Router.route('/')
    .get(authMiddleware.isAuthorized, (req,res) => {
        res.status(StatusCodes.OK).json({ message: 'GET: API get list boards ' }) 
    })
    .post(authMiddleware.isAuthorized, boardValidation.createNew , boardController.createNew)
    
Router.route('/:id')
    .get(authMiddleware.isAuthorized, boardController.getDetails)
    .put(authMiddleware.isAuthorized, boardValidation.update , boardController.update)//update
//API hỗ trợ cho việc dic chuyển card giữa các columns khác nhau
Router.route('/supports/moving_card')
    .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn , boardController.moveCardToDifferentColumn)

export const boardRoute = Router
