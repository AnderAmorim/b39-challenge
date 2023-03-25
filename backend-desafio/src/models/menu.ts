import { model, Schema } from 'mongoose'

export interface IMenu {
    _id?: string
    name: string
    relatedId?: number
    id: number,
}

const schemaMenuDb = new Schema<IMenu>({
    name: { type: String, required: true },
    relatedId: { type: Number, required: false },
    id:  { type: Number, required: false },
})

schemaMenuDb.index({ id: 1 });


export default model<IMenu>('menu', schemaMenuDb, 'menu')