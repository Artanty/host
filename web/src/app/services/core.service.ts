import { Inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class CoreService {
    
    private _routerPath = '/'

    // private _isRouterPathSet$ = new Subject<void>()
    // public isRouterPathSet$ = this._isRouterPathSet$.asObservable()

    public setRouterPath (data: string) {
        console.log('Router path changed: ' + data)
        this._routerPath = data
        // this._isRouterPathSet$.next()
    }

    public getRouterPath() {
        return this._routerPath;
    }

    public isDev (): boolean {
        return this.getBaseUrl().includes('http://localhost')
    }

    public isInsideHost (): boolean {
        return this._routerPath !== '/'
    }

    public getBaseUrl (): string {
        return __webpack_public_path__;
    }
}