import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { RemoteConfigService } from '../services/remote-config.service';
import { InterceptorConfig, InterceptorConfigModification } from '../app.component.types';
import { catchError, EMPTY, throwError } from 'rxjs';
import { BusEvent, EVENT_BUS_PUSHER } from 'typlib';

export const remoteInterceptor: HttpInterceptorFn = (req, next) => {
  const remoteConfigService = inject(RemoteConfigService)
  const eventBusPusher = inject(EVENT_BUS_PUSHER)
  console.log(remoteConfigService.getInterceptors())
  const interceptorConfigs = remoteConfigService.getInterceptors()

  const requestConfigs: InterceptorConfig[] = interceptorConfigs.filter(el => _isRequestConfig(req, el))
  
  let modifiedReq = req.clone();
  if (requestConfigs.length) {
    
    requestConfigs.forEach(config => {

      config.data?.forEach((mod: InterceptorConfigModification) => {
        let addedValue: string | null = ''
        switch (mod.valueHandler.source) {
          case 'localStorage':
            addedValue = localStorage.getItem(mod.valueHandler.prop);
            break;
          case 'window':
            addedValue = _getNestedWindowProperty(mod.valueHandler.prop)
            break;
          default:
            addedValue = 'TODO'
        }
      

        if (mod.valueHandler.prepend) {
          addedValue = `${mod.valueHandler.prepend}${addedValue}`
        }

        switch (mod.target) {
          case 'headers':
            modifiedReq = modifiedReq.clone({
              headers: modifiedReq.headers.set(mod.key, String(addedValue))
            });
            break;
          case 'body':
            if (!modifiedReq.body) throw new Error('')
            modifiedReq = modifiedReq.clone({
              body: { ...modifiedReq.body, [mod.key]: addedValue }
            });  
            break;
          default:  
            console.log("something's wrong in the neighborhood")
        }
      });
    })
  }

  

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorConfigs: InterceptorConfig[] = interceptorConfigs.filter(el => _isErrorConfig(error, el))

      if (errorConfigs.length) {
        errorConfigs.forEach(el => {
          _onErrorAction(el, eventBusPusher);  
        })
        
        return EMPTY;
      }
      return throwError(() => error);
    })
  );
};

function _isRequestConfig(req: HttpRequest<unknown>, config: InterceptorConfig): boolean {
  if (config.on === 'REQUEST') {
    const url = req.url
    const exp = config.url_pattern
    const cleanExp = exp?.replace(/^\/|\/$/g, '');
    if (!cleanExp) {
      return false;
    }
    const isMatchedUrl = new RegExp(cleanExp).test(url)  
    return !config.url_pattern || isMatchedUrl
  }
  return false;
}

function _isErrorConfig(error: HttpErrorResponse, config: InterceptorConfig): boolean {
  if (config.on === 'ERROR') {
    if (config.trigger === error.status) {
      return true
    }
  }
  return false;
}

function _onErrorAction(config: InterceptorConfig, eventBusPusher: any): void {
  
  
  const busEvent: BusEvent = {
    from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
    to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
    event: config.action!, // todo
    payload: { routerPath: config.project_id }, // todo
  };
  console.log('ERROR interceptor is triggering ' + config.action + ' ACTION')
  eventBusPusher(busEvent)
}

function _getNestedWindowProperty(path: string): any {
  const parts = path.split('.');
  let current: any = window;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      throw new Error(`Property '${part}' not found in path '${path}'`);
    }
    current = current[part];
  }
  
  return current;
}