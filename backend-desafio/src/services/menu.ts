import mongoose from "mongoose";
import Menu, { IMenu } from "../models/menu"
import { IMenuItem } from "./interfaces/menu-item";
import { IMenuItemFromDB } from "./interfaces/menu-item-from-db";


const searchParent = function(allItems: IMenuItemFromDB[], item: IMenuItemFromDB): IMenuItemFromDB | undefined {
  return allItems.find(
    (findItem) =>
      findItem.id.toString() === item.relatedId?.toString()
  );
}

const organizeMenuStructure = function(allIMenuItemsFromDb: IMenuItemFromDB[]): IMenuItemFromDB[] {

  const returnMenuItemsNoSubmenus = function(allIMenuItemsFromDb: IMenuItemFromDB[]){
    return allIMenuItemsFromDb.filter((itemFromDB) => !itemFromDB.relatedId);
  }

  const menuItemsFromDb = allIMenuItemsFromDb.map((itemFromDB:IMenuItemFromDB) =>
    Object.assign({}, itemFromDB._doc)
  );

  menuItemsFromDb.forEach((itemFromDB:IMenuItemFromDB) => {
    let parentMenu: IMenuItemFromDB | undefined = undefined;
    const haveParent = itemFromDB.relatedId;

    if (haveParent) {
      parentMenu = searchParent(menuItemsFromDb, itemFromDB); 
    }

    if (parentMenu) {
      if (!parentMenu.submenus) {
        parentMenu.submenus = [];
      }
      parentMenu.submenus.push(itemFromDB);
    }
  });

  return returnMenuItemsNoSubmenus(menuItemsFromDb)
}


const clearMenu = function (arrToClear: IMenuItem[]): IMenuItem[] {

  const transformSubmenus = function(submenus: IMenuItem[]): IMenuItem[] {
    const transformedAllSubmenus: IMenuItem[] = [];
  
    for (const submenu of submenus) {
      const transformedSubmenu: IMenuItem = {
        id: submenu.id,
        name: submenu.name,
      };
  
      if (submenu.submenus) {
        transformedSubmenu.submenus = transformSubmenus(submenu.submenus);
      }
  
      transformedAllSubmenus.push(transformedSubmenu);
    }
  
    return transformedAllSubmenus;
  }

  const transformedArr: IMenuItem[] = [];

  for (const arrItem of arrToClear) {
    const transformedObj: IMenuItem = {
      id: arrItem.id,
      name: arrItem.name,
    };
    if (arrItem.submenus) {
      transformedObj.submenus = transformSubmenus(arrItem.submenus);
    }

    transformedArr.push(transformedObj);
  }

  return transformedArr;
}

const existsParentMenu = async function(parentId: number): Promise<IMenu | undefined> {
  const menu = await Menu.findOne({ id: parentId }) as IMenu | undefined
  return menu
}

const deleteItemMenu = async function (menuItem:IMenuItemFromDB, newRelatedIdToChildrenOfExcludedItem:number|null):Promise<void>{
    // await mongoose.connection.transaction(async (session) => {
      await Menu.deleteOne({ id: menuItem.id })//, { session });
      await Menu.updateMany({ relatedId: menuItem.id }, { relatedId: newRelatedIdToChildrenOfExcludedItem })//, { session });
      await Menu.updateOne({ childrenId: { $all: [menuItem.id] } }, { $pull: { childrenId: menuItem.id } })//, { session });
    // })
}

const getAllWIthMongoQuery = async function () : Promise<IMenuItemFromDB[]>{
  return await Menu.collection.aggregate([
    {
        $graphLookup: {
            from: "menu", // Nome da coleçãoIMenuItemFromDB[]
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
]).toArray() as IMenuItemFromDB[]
}

interface IMenuService {
  organizeMenuStructure: (allIMenuItemsFromDb: IMenuItemFromDB[]) => IMenuItemFromDB[];
  clearMenu: (arr: IMenuItem[]) => IMenuItem[];
  deleteItemMenu: (menuItem: IMenuItemFromDB, newRelatedIdToChildrenOfExcludedItem: number | null) => Promise<void>;
  getAllWIthMongoQuery: () => Promise<IMenuItemFromDB[]>;
  existsParentMenu: (parentId: number) => Promise<IMenu | undefined>;
}

export const MenuService:IMenuService = {
  organizeMenuStructure,
  clearMenu,
  deleteItemMenu,
  getAllWIthMongoQuery,
  existsParentMenu,
}

