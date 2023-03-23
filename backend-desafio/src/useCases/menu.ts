import Menu, { IMenu } from "../models/menu"

export interface MenuItemFromDB {
  _id: string;
  name: string;
  id: number;
  childrenId: number[];
  __v: number;
  relatedId?: number;
  submenus?: MenuItemFromDB[];
  _doc?:any
}


export interface MenuItem {
  id: number;
  name: string;
  submenus?: MenuItem[];
}

export function oreganizeMenu(allIMenuItemsFromDb: MenuItemFromDB[]): MenuItemFromDB[] {
  const menuItemsFromDb = allIMenuItemsFromDb.map((itemFromDB:MenuItemFromDB) =>
    Object.assign({}, itemFromDB._doc)
  );

  menuItemsFromDb.forEach((itemFromDB:MenuItemFromDB) => {
    let parentMenu: MenuItemFromDB | undefined = undefined;
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

  return returnMenuItemssNoSubmenus(menuItemsFromDb)
}

function searchParent(allItems: MenuItemFromDB[], item: MenuItemFromDB): MenuItemFromDB | undefined {
  return allItems.find(
    (findItem) =>
      findItem.id.toString() === item.relatedId?.toString()
  );
}

function returnMenuItemssNoSubmenus(allIMenuItemsFromDb: MenuItemFromDB[]){
  return allIMenuItemsFromDb.filter((itemFromDB) => !itemFromDB.relatedId);
}

export function clearMenu(arr: MenuItem[]): MenuItem[] {
  const transformedArr: MenuItem[] = [];

  for (const obj of arr) {
    const transformedObj: MenuItem = {
      id: obj.id,
      name: obj.name,
    };

    if (obj.submenus) {
      transformedObj.submenus = transformSubmenus(obj.submenus);
    }

    transformedArr.push(transformedObj);
  }

  return transformedArr;
}

function transformSubmenus(submenus: MenuItem[]): MenuItem[] {
  const transformedSubmenus: MenuItem[] = [];

  for (const submenu of submenus) {
    const transformedSubmenu: MenuItem = {
      id: submenu.id,
      name: submenu.name,
    };

    if (submenu.submenus) {
      transformedSubmenu.submenus = transformSubmenus(submenu.submenus);
    }

    transformedSubmenus.push(transformedSubmenu);
  }

  return transformedSubmenus;
}
export async function existsParentMenu(parentId: number): Promise<IMenu | undefined> {
  const menu = await Menu.findOne({ id: parentId }) as unknown as IMenu | undefined
  return menu
}

export async function updateParentMenu(parentId: number, childrenId: number): Promise<any> {
  await Menu.updateOne(
    { id: parentId },
    { $push: { childrenId } }
  )
}

