/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi  from 'joi'
import { ObjectId, returnDocument } from 'mongodb'
import { OBJECT_ID_RULE,OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'
import { BOARD_TYPES } from '~/utils/constants'
//define  Collection (name & Schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    // type: Joi.string().valid('public', 'private').required(),
    // Tip: thay vì gọi lần lượt tất cả type của board để cho vòa hàm valid() thì có thể viết gọn lại
    // bằng Object.values() kết hợp Spread Operator của JS.cụ thể : .valid(...Object.values(BOARD_TYPE))
    // làm như trên thì sau này dù có thêm hay sửa gì của BOARD_types trong file constants thì ở những chỗ dùng Joi trong 
    // Model hay validation cũng không phải đụng vào nữa .
    type: Joi.string().required().valid(...Object.values(BOARD_TYPES)),
    columnOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    //Những Admin của board
    ownerIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    //Những thành viên của board
    memberIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    createdAt : Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)

})
//chỉ định những hàm mà chúng  ta không muốn cho phép cập nhật trong hầm update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const validateBeforeCreate = async(data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {abortEarly : false})
}
const createNew = async (userId, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const newBoardToAdd = {
            ...validData,
            ownerIds: [new ObjectId(String(userId))]
        }
        // console.log('valid Data:',validData);
        const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
        return createBoard
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async(boardId) => {
    try {
        
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(String(boardId))
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
const getDetails = async(userId, boardId) => {
    try {
        //hôm này hàm này tạm thời giống hàm findOneById và sẽ tiếp tục được update
        const queryConditions = [
            { _id: new ObjectId(String(boardId)) },
            // Điều hiện 01: Board chưa bị xóa
            {_destroy: false },
            // Điều kiện 2: cái thằng userId đang thực hiện request này phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds , sử dụng toán tử $all của mongodb
            {$or: [
                { ownerIds: { $all: [new ObjectId(String(userId))] } },
                { memberIds: { $all: [new ObjectId(String(userId))] } }
            ]}
        ]

        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            { $match : { $and: queryConditions } },
            { $lookup: {
                from: columnModel.COLUMN_COLLECTION_NAME,
                localField: '_id',
                foreignField : 'boardId',
                as: 'columns'
            } },
            { $lookup: {
                from: cardModel.CARD_COLLECTION_NAME,
                localField: '_id',
                foreignField : 'boardId',
                as: 'cards'
            }},
            { $lookup: {
                from: userModel.USER_COLLECTION_NAME,
                localField: 'memberIds',
                foreignField: '_id',
                as: 'members',
                //pipeline trong loookup là đẻ xử lí một hoặc nhiều luồng cần thiết
                //$project để chỉ định vài field không muốn lấy về bằng cách gán giá trị 0
                pipeline: [{$project: {'password': 0, 'verifyToken': 0 }}]
            }},
            { $lookup: {
                from: userModel.USER_COLLECTION_NAME,
                localField: 'ownerIds',
                foreignField: '_id',
                as: 'owners',
                pipeline: [{$project: {'password': 0, 'verifyToken': 0 }}]
            }}
        ]).toArray()
        return result[0] || null
    } catch (error) {
        throw new Error(error)
    }
}
//nhiệm vụ của function này là cập nhật push 1 giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) =>{
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(column.boardId)),},
            { $push : { columnOrderIds: new ObjectId(String(column._id)) } },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
//hàm này để láy một phần tử columnId ra khỏi mảng columnOrderIds
//dùng $pull trong mongoDB ở th này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) =>{
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(column.boardId)),},
            { $pull : { columnOrderIds: new ObjectId(String(column._id)) } },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (boardId , updateData) =>{
    try {
        //lọc những field mà chúng ta không cho phép cập nhật lih tinh 
        Object.keys(updateData).forEach(fieldName => {
            if(INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
         // đối với những dữ liệu mà liên quan đến ObjectId, biến đổi ở đây
        if(updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
        }

        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(boardId)) },
            { $set :  updateData },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const getBoards = async (userId,page , itemsPerPage) =>{
    try {
        const queryConditions = [
            // Điều hiện 01: Board chưa bị xóa
            {_destroy: false },
            // Điều kiện 2: cái thằng userId đang thực hiện request này phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds , sử dụng toán tử $all của mongodb
            {$or: [
                { ownerIds: { $all: [new ObjectId(String(userId))] } },
                { memberIds: { $all: [new ObjectId(String(userId))] } }
            ]}
        ]
        const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
            [
                { $match: { $and: queryConditions } },
                //Sort title của board theoA-Z (mặc địn sẽ bị chữ B hoa đứng trước chữ a thường (theo chuẩn mã ASCII
                {$sort: { title: 1 } },
                //$pacet để xử lí nhiều luồng trog 1 query
                {$facet: {
                    //Luồng 01 : Query boards
                    'queryBoards': [
                        { $skip: pagingSkipValue(page, itemsPerPage) },//bỏ qua số lưognj bản ghi của những page trước đó
                        { $limit: itemsPerPage } // giới hạn tối đa số lượng bản ghi trả về trong 1 page
                    ],
                    //luồng 02: Query đến tổng tất cả số lượng bản ghi board trong db và trả về vào biến countedAllBoards
                    'queryTotalBoards':[{ $count: 'countedAllBoards'}]
                }}
            ],
            //khai báo thêm thuộc tính collaction locale: 'en' để fix vụ chữu B viết trước chữ a thườn ở trên
            { collation: { locale: 'en' } }
        ).toArray()
        console.log('query:',query);
        const res = query[0]
        return {
            boards: res.queryBoards || [],
            totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0

        }
    } catch (error) {
        throw new Error(error)
    }
}
const pushMemberIds= async (boardId, userId ) =>{
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(boardId))},
            { $push : { memberIds: new ObjectId(String(userId)) } },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
export const boardModel = {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    pullColumnOrderIds,
    update,
    getBoards,
    pushMemberIds
}
//boardID: 687a4e1419077f7ff489e057
//columnid: 687a55dfafe5d61253f35ae6
//cardId: 687a5711afe5d61253f35ae9