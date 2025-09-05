/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express'
import {StatusCodes} from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute'
const Router = express.Router()
//check api v1/stastus
Router.get('/status', (req,res)=> {
    res.status(StatusCodes.OK).json({message: 'APIs V1 are ready to use'
    })

})
//board APIs/
Router.use( '/boards', boardRoute)
// column APIs
Router.use( '/columns', columnRoute)
//card APIs
Router.use( '/cards', cardRoute)

//user APIs
Router.use( '/users', userRoute)
// invitetion APIs
Router.use('/invitations', invitationRoute )
export const APIs_V1 = Router