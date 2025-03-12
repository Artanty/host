import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    data = []
    setData (data: any) {
        this.data = data
    }
    getData() {
        return this.data
    }
}