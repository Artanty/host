import { LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation"
import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { BusEvent } from "typlib"


export interface RegisterComponentsBusEventPayloadItem {
    customElementName: string
    customElementInputs: any,
    customElementTransclusion: string
}

export type RegisterComponentsBusEvent = BusEvent<{
    componentType: string,
    items: RegisterComponentsBusEventPayloadItem[]
}>


// export interface BusEvent<T = Record<string, any>> {
//   from: string;
//   to: string;
//   event: string;
//   payload: T;
//   self?: true;
//   status?: string;
// }

export interface SendStatData {
  projectId: string
  slaveRepo: string
  commit: string
}

export interface ChromeMessagePayload {
  projectId: string
  namespace: string
  stage: 'UNKNOWN' | 'RUNTIME',
  eventData: string | SendStatData
}

export interface ChromeMessage { // todo change to busEvent, add payload generic to busEvent
  from: string
  to: string
  event: string
  payload: Record<string, any>
}


export interface RemoteBody {
  isEagerLoading: boolean
  url: string,
  buttonName: string,
  buttonTitle: string,
  remoteModuleScript: LoadRemoteModuleScriptOptions,
  routerPath: string
  moduleName: string
}

export interface Remotes {
  [key: string]: RemoteBody
}
export interface ProductButton {
  projectId: string
  imgSrcBaseUrl: string,
  buttonName: string
  buttonTitle: string
  routerPath: string
  buttonState: string
}