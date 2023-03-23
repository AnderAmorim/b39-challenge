"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParentMenu = exports.existsParentMenu = exports.clearMenu = exports.oreganizeMenu = void 0;
const menu_1 = __importDefault(require("../models/menu"));
function oreganizeMenu(allIMenuItemsFromDb) {
    const menuItemsFromDb = allIMenuItemsFromDb.map((itemFromDB) => Object.assign({}, itemFromDB._doc));
    menuItemsFromDb.forEach((itemFromDB) => {
        let parentMenu = undefined;
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
    return returnMenuItemssNoSubmenus(menuItemsFromDb);
}
exports.oreganizeMenu = oreganizeMenu;
function searchParent(allItems, item) {
    return allItems.find((findItem) => { var _a; return findItem.id.toString() === ((_a = item.relatedId) === null || _a === void 0 ? void 0 : _a.toString()); });
}
function returnMenuItemssNoSubmenus(allIMenuItemsFromDb) {
    return allIMenuItemsFromDb.filter((itemFromDB) => !itemFromDB.relatedId);
}
function clearMenu(arr) {
    const transformedArr = [];
    for (const obj of arr) {
        const transformedObj = {
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
exports.clearMenu = clearMenu;
function transformSubmenus(submenus) {
    const transformedSubmenus = [];
    for (const submenu of submenus) {
        const transformedSubmenu = {
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
function existsParentMenu(parentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const menu = yield menu_1.default.findOne({ id: parentId });
        return menu;
    });
}
exports.existsParentMenu = existsParentMenu;
function updateParentMenu(parentId, childrenId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield menu_1.default.updateOne({ id: parentId }, { $push: { childrenId } });
    });
}
exports.updateParentMenu = updateParentMenu;
