import { IFile } from "interfaces";

export default function findInArray(array:Array<IFile>,  file:IFile) {
    for(var i = 0; i < array.length; i += 1) {
        const fullPath = `${array[i].url}/${array[i].name}`;
        const compareFile = `${file.url}/${file.name}`;
        if(fullPath == compareFile) {
            return i;
        }
    }
    return -1;
}