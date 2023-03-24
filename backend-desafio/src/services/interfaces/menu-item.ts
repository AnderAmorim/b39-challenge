export interface IMenuItem {
  id: number;
  name: string;
  submenus?: IMenuItem[];
}