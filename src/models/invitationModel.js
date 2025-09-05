import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { userModel } from './userModel'
import { boardModel } from './boardModel'


const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
    inviterId : Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),//người đi mời
    inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),//người được mời
    //Kiểu của cái lời mời
    type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
    boardInvitation: Joi.object({
        boardId : Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
    }).optional(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})
// chỉ định những field mà chúng ta không cho phép cập nhạt trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId','type', 'createdAt']
const validateBeforeCreate = async (data) => {
    return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {abortEarly: false})
}

const createNewBoardInvitation =async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        //biến đổi một số dữ liệu liên quan tới ObjectId chuẩn chỉnh
        let newInvitationToAdd = {
            ...validData,
            inviterId: new ObjectId(String(validData.inviterId)),
            inviteeId: new ObjectId(String(validData.inviteeId))
        }
        // Nếu tồn tại dữ liệu BoardInvitation thì mới update cho boardId
        if(validData.boardInvitation) {
            newInvitationToAdd.boardInvitation = {
                ...validData.boardInvitation,
                boardId: new ObjectId(String(validData.boardInvitation.boardId))
            }
        }
        // Gọi insert vào DB
        const createInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
        return createInvitation

    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async( invitationId) => {
    try {
        const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(String(invitationId)) })
        return result
    } catch (error) {
        throw new Error(error)
    }
    
}
const update = async (invitationId , updateData) => {
    try {
        Object.keys(updateData).forEach( fielName => {

            if( INVALID_UPDATE_FIELDS.includes(fielName) ) {
                delete updateData[fielName]
            }
        })
        // đói với những dữ liệu liên quan Object Id biến đổi ở đây
        if( updateData.boardInvitation) {
            updateData.boardInvitation = {
                ...updateData.boardInvitation,
                boardId : new ObjectId(String(updateData.boardInvitation.boardId))
            }
        }
        const result =await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(invitationId))},
            {$set: updateData},
            {returnDocument: 'after'}
        )
        return result
    } catch (error) {
        throw new Error(error)
    } 
}
//lays nhỮng bản ghi invations thuộc về thằng user cụ thể
const findByUser = async(userId) => {
    try {
        const queryConditions = [
            { inviteeId: new ObjectId(String(userId))  },//Tìm theo inviteeId - người được mời -người đnag thực hiện req này
            // Điều hiện 01: Board chưa bị xóa
            {_destroy: false },
            
        ]

        const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
            { $match : { $and: queryConditions } },
            
            
            { $lookup: {
                from: userModel.USER_COLLECTION_NAME,
                localField: 'inviterId',//Người đi mời
                foreignField: '_id',
                as: 'inviter',
                //pipeline trong loookup là đẻ xử lí một hoặc nhiều luồng cần thiết
                //$project để chỉ định vài field không muốn lấy về bằng cách gán giá trị 0
                pipeline: [{$project: {'password': 0, 'verifyToken': 0 }}]
            }},
            { $lookup: {
                from: userModel.USER_COLLECTION_NAME,
                localField: 'inviteeId',//người được mời
                foreignField: '_id',
                as: 'invitee',
                //pipeline trong loookup là đẻ xử lí một hoặc nhiều luồng cần thiết
                //$project để chỉ định vài field không muốn lấy về bằng cách gán giá trị 0
                pipeline: [{$project: {'password': 0, 'verifyToken': 0 }}]
            }},
            { $lookup: {
                from: boardModel.BOARD_COLLECTION_NAME,
                localField: 'boardInvitation.boardId',// thônng tin của board
                foreignField: '_id',
                as: 'board',
            }}
            
        ]).toArray()
        return results
    } catch (error) {
        throw new Error(error)
    }
}
export const invitationModel = {
    INVITATION_COLLECTION_NAME,
    INVITATION_COLLECTION_SCHEMA,
    update,
    findOneById,
    createNewBoardInvitation,
    findByUser

}