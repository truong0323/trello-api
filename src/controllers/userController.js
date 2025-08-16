import { StatusCodes } from 'http-status-codes'
import {userService} from '~/services/userService'
const createNew = async (req, res, next) => {
    try {
       
        // console.log('req.body : ',req.body);
        // điều hướng dữ liệu sang service
        const createdUser = await userService.createNew(req.body)

        res.status(StatusCodes.CREATED).json(createdUser ) 
    }
    catch (error) {
        next(error) 
    }

}
export const userController ={
    createNew
}