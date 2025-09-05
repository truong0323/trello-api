import express from  'express' 
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/AuthMiddleware'
import { invitationValidation } from '~/validations/invitationValidation'

const Router = express.Router()

Router.route('/board')
    .post(authMiddleware.isAuthorized,
        invitationValidation.createNewBoardInvitation,
        invitationController.createNewBoardInvitation

    )
//lấy thông báo của thằng hiện tại đnag đứng
Router.route('/')
    .get(authMiddleware.isAuthorized , invitationController.getInvitations)
Router.route('/board/:invitationId')
    .put(authMiddleware.isAuthorized, invitationController.updateBoardInvitation)
export const invitationRoute = Router