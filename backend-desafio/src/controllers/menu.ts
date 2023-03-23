import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Menu, { IMenu } from '../models/menu'
import counterIncrement from '../useCases/counter'
import { clearMenu, existsParentMenu, MenuItem, MenuItemFromDB, oreganizeMenu, updateParentMenu } from '../useCases/menu'

export default {
    create: async (req: Request, res: Response): Promise<Response> => {
        const { name, relatedId } = req.body
        const parentInformed = relatedId

        let parentMenu: IMenu | undefined;
        const counterName:string = 'menucounter'
        const idIncremental:number = await counterIncrement(counterName)

        if (parentInformed) {
            parentMenu = await existsParentMenu(relatedId)
            if (!parentMenu) return res.status(400).json({ message: 'Related menu not found' })

            await updateParentMenu(parentMenu.id, idIncremental)
        }

        const { _id: id } = await Menu.create({ name, relatedId, id: idIncremental })
        return res.status(201).json({
            id,
        })
    },

    delete: async (req: Request, res: Response): Promise<Response> => {
        const menu = await Menu.findOne({ id: req.params.id })
        if (!menu || !menu?.id)
            return res.status(400).json({ message: 'Menu not found to exclude' })
        
        //Se possuir um pai, esse pai passará a ser os filhos do item excluido
        const newRelatedIdToChildrenOfExcludedItem = menu.relatedId? menu.relatedId:null

        // const session = await mongoose.startSession();
        // try {
        //     await mongoose.connection.transaction(async (session) => {
                await Menu.deleteOne({ id: menu.id })//, { session });
                await Menu.updateMany({ relatedId: menu.id }, { relatedId: newRelatedIdToChildrenOfExcludedItem })//, { session });
                await Menu.updateOne({ childrenId: { $all: [menu.id] } }, { $pull: { childrenId: menu.id } })//, { session });
            // });
        // } catch (error) {
        //     return res.status(500).json({
        //        message: 'there was an error while deleting the menu',
        //     })
        // } finally {
        //     await session.endSession();
        // }

        return res.status(200).json({
            message: 'Menu excluded',
        })
    },

    getAll: async (_: Request, res: Response): Promise<Response> => {
        let allItems = await Menu.find() as MenuItemFromDB[]

        if (allItems.length) {
            allItems = oreganizeMenu(allItems as MenuItemFromDB[]) as MenuItemFromDB[]
        }

        const cleanMenu = clearMenu(allItems) as MenuItem[]

        return res.json(cleanMenu)
    },

    getAllWithMongodbOnly: async (_: Request, res: Response): Promise<Response> => {
        const menus = await Menu.collection.aggregate([
            {
                $graphLookup: {
                    from: "menu", // Nome da coleção
                    startWith: "$id", // Começa a busca a partir do campo "id"
                    connectFromField: "id", // Campo que será comparado com o "connectToField"
                    connectToField: "relatedId", // Campo que será comparado com o "connectFromField"
                    as: "submenus", // Nome do array que armazenará os documentos encontrados
                }
            },
            {
                $addFields: {
                    submenus: {
                        $map: { // Percore o array "children" para encontrar os filhos dos filhos e assim por diante
                            input: "$submenus",
                            as: "child",
                            in: {
                                $mergeObjects: [
                                    "$$child",
                                    {
                                        children: {
                                            $filter: {
                                                input: "$$child.children",
                                                as: "grandchild",
                                                cond: { $in: ["$$grandchild.id", "$$child.relatedId"] }
                                            }
                                        }
                                    }
                                ]
                            },
                        }
                    }
                }
            },
            {
                $project: {
                    relatedId: 0, // Remove o campo "relatedId" para evitar duplicações
                    _id: 0,
                    childrenId: 0,
                    __v: 0,
                    children: 0
                }
            }
        ]).toArray()

        return res.json(menus)
    },

    deleteAll: async (req: Request, res: Response): Promise<Response> => {
        await Menu.deleteMany()
        return res.status(200).json({ message: 'All menu exclude' })
    },
}