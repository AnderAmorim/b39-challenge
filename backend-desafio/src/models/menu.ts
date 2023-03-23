import { model, Schema } from 'mongoose'

export interface IMenu {
    _id?: string
    name: string
    relatedId: number
    id: number,
    childrenId?: Array<number>
}

const schemaMenuDb = new Schema<IMenu>({
    name: { type: String, required: true },
    relatedId: { type: Number, required: false },
    id:  { type: Number, required: false },
    childrenId:{
        type:[Number],
        required: false
    }
})

export default model<IMenu>('menu', schemaMenuDb, 'menu')