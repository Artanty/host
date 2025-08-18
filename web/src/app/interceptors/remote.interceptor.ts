import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { RemoteConfigService } from '../services/remote-config.service';
import { InterceptorConfig, InterceptorConfigModification } from '../app.component.types';

export const remoteInterceptor: HttpInterceptorFn = (req, next) => {
  const remoteConfigService = inject(RemoteConfigService)
  console.log(remoteConfigService.getInterceptors())
  const interceptorConfigs = remoteConfigService.getInterceptors()

  const activateConfigs: InterceptorConfig[] = interceptorConfigs.filter(el => _isMatchedUrl(req, el))
  
  if (!activateConfigs.length) {
    return next(req);
  }
  
  let modifiedReq = req.clone();

  activateConfigs.forEach(config => {

    config.data.forEach((mod: InterceptorConfigModification) => {
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

  return next(modifiedReq);
};

function _isMatchedUrl(req: HttpRequest<unknown>, config: InterceptorConfig): boolean {
  const url = req.url
  const exp = config.url_pattern
  const cleanExp = exp.replace(/^\/|\/$/g, '');
  const isMatchedUrl = new RegExp(cleanExp).test(url)

  return !config.url_pattern || isMatchedUrl
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