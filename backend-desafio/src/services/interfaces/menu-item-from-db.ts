export interface IMenuItemFromDB {
  _id: string;
  name: string;
  id: number;
  childrenId: number[];
  __v: number;
  relatedId?: number;
  submenus?: IMenuItemFromDB[];
  _doc?:any
}