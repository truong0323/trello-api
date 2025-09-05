import { StatusCodes } from 'http-status-codes'
import {userService} from '~/services/userService'
import ms from 'ms'
import ApiError from '~/utils/ApiError'
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
const  verifyAccount= async (req, res, next) => {
    try {
       
        // console.log('req.body : ',req.body);
        // điều hướng dữ liệu sang service
        const result = await userService.verifyAccount(req.body)

        res.status(StatusCodes.OK).json(result ) 
    }
    catch (error) {
        next(error) 
    }

}
const login = async (req, res, next) => {
    try {
       
        // console.log('req.body : ',req.body);
        // điều hướng dữ liệu sang service
        const result = await userService.login(req.body)

        //xuwr lí trả về http only cookie cho phía trình duyệt
        // về cái maxAge và thư viện ms 
        // đối với việc maxAge-thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày , tùy dự án ,lưu ý thời gian sống của cookie khác với thời
        // gian sống của token
        res.cookie('accessToken',result.accessToken,{
            httpOnly: true,
            secure:true,
            sameSite: 'none',
            maxAge: ms('14 days')
        })
        res.cookie('refreshToken',result.refreshToken,{
            httpOnly: true,
            secure:true,
            sameSite: 'none',
            maxAge: ms('14 days')
        })
        res.status(StatusCodes.OK).json(result ) 
    }
    catch (error) {
        next(error) 
    }

}

const logout = async (req,res, next) => {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.status(StatusCodes.OK).json({ loggedOut: true })
    } catch (error) {
        next(error)
    }
}
const refreshToken = async (req,res, next) => {
    try {
        const result = await userService.refreshToken(req.cookies?.refreshToken)
        res.cookie('accessToken', result.accessToken , 
            {httpOnly: true, 
            secure: true, 
            sameSite: 'none',
            maxAge: ms('14 days') 
        })
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(new ApiError(StatusCodes.FORBIDDEN , 'please Sign In!(Error from refesh token'))
    }
}
const update = async (req,res,next ) => {
    try {
        const userId = req.jwtDecoded._id
        const userAvatarFile = req.file
        // console.log('controller - userAvatarFile: ', userAvatarFile);
        const updateUser = await userService.update(userId , req.body, userAvatarFile)
        res.status(StatusCodes.OK).json(updateUser)
    } catch (error) {
        next(error)
    }
}

export const userController ={
    createNew,
    verifyAccount,
    login,
    logout,
    refreshToken,
    update
}